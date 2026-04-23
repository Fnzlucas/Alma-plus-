export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL manquante' });

  try {
    // Normaliser l'URL
    const fullUrl = url.startsWith('http') ? url : 'https://' + url;

    // Fetch du site avec timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(fullUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9'
      }
    });
    clearTimeout(timeout);

    const html = await response.text();

    // ── Patterns de détection d'email ──
    const patterns = [
      // Email standard
      /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
      // Obfusqué avec [at] ou (at)
      /[a-zA-Z0-9._%+\-]+\s*[\[\(]at[\]\)]\s*[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/gi,
      // Obfusqué avec espaces : contact @ domain . fr
      /[a-zA-Z0-9._%+\-]+\s+@\s+[a-zA-Z0-9.\-]+\s+\.\s+[a-zA-Z]{2,}/g,
      // Encodé en HTML entities &#64; = @
      /[a-zA-Z0-9._%+\-]+&#64;[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    ];

    const found = new Set();

    // Pattern standard
    const standardMatches = html.match(patterns[0]) || [];
    standardMatches.forEach(e => found.add(e.toLowerCase()));

    // Pattern [at] / (at)
    const atMatches = html.match(patterns[1]) || [];
    atMatches.forEach(e => {
      const clean = e.replace(/\s*[\[\(]at[\]\)]\s*/i, '@').toLowerCase();
      found.add(clean);
    });

    // Pattern espaces
    const spaceMatches = html.match(patterns[2]) || [];
    spaceMatches.forEach(e => {
      const clean = e.replace(/\s+@\s+/, '@').replace(/\s+\.\s+/, '.').toLowerCase();
      found.add(clean);
    });

    // Pattern HTML entity
    const entityMatches = html.match(patterns[3]) || [];
    entityMatches.forEach(e => {
      const clean = e.replace('&#64;', '@').toLowerCase();
      found.add(clean);
    });

    // Chercher aussi dans les liens mailto:
    const mailtoMatches = html.match(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g) || [];
    mailtoMatches.forEach(e => {
      found.add(e.replace('mailto:', '').toLowerCase());
    });

    // Filtrer les faux positifs (images, fichiers, librairies)
    const blacklist = [
      'wix.com', 'shopify.com', 'wordpress.com', 'google.com', 'facebook.com',
      'twitter.com', 'instagram.com', 'youtube.com', 'cloudflare.com',
      'sentry.io', 'analytics', 'example.com', 'test.com', '.png', '.jpg',
      '.gif', '.svg', '.css', '.js', 'schema.org', 'w3.org', 'jquery',
      'bootstrap', 'fontawesome', 'googleapis', 'gstatic', 'gtm.js'
    ];

    const emails = [...found].filter(email => {
      if (!email.includes('@')) return false;
      const domain = email.split('@')[1] || '';
      return !blacklist.some(b => email.includes(b) || domain.includes(b));
    });

    // Trier par priorité : contact@, info@, accueil@, devis@ avant les autres
    const priority = ['contact', 'info', 'accueil', 'devis', 'pro', 'service', 'commercial'];
    emails.sort((a, b) => {
      const localA = a.split('@')[0];
      const localB = b.split('@')[0];
      const prioA = priority.findIndex(p => localA.includes(p));
      const prioB = priority.findIndex(p => localB.includes(p));
      if (prioA !== -1 && prioB === -1) return -1;
      if (prioA === -1 && prioB !== -1) return 1;
      return 0;
    });

    // Si pas trouvé sur la page principale, essayer /contact
    if (emails.length === 0) {
      try {
        const contactUrl = fullUrl.replace(/\/$/, '') + '/contact';
        const controller2 = new AbortController();
        const timeout2 = setTimeout(() => controller2.abort(), 5000);
        const r2 = await fetch(contactUrl, {
          signal: controller2.signal,
          headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' }
        });
        clearTimeout(timeout2);
        const html2 = await r2.text();
        const m2 = html2.match(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g) || [];
        const m3 = html2.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
        [...m2, ...m3].forEach(e => {
          const clean = e.replace('mailto:', '').toLowerCase();
          if (!blacklist.some(b => clean.includes(b))) emails.push(clean);
        });
      } catch (_) {}
    }

    const unique = [...new Set(emails)].slice(0, 5);

    return res.status(200).json({
      emails: unique,
      primary: unique[0] || null,
      count: unique.length,
      source: fullUrl
    });

  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(200).json({ emails: [], primary: null, count: 0, error: 'timeout' });
    }
    return res.status(200).json({ emails: [], primary: null, count: 0, error: err.message });
  }
}
