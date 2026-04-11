// api/send-email.js
// Proxy sécurisé vers l'API Resend — clé jamais exposée côté client
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const { fromName, to, subject, body } = req.body;

  if (!fromName || !to || !subject || !body) {
    return res.status(400).json({ error: 'fromName, to, subject et body sont requis' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${fromName} <contact@huntlist.fr>`,
        to,
        subject,
        html: body,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.message || 'erreur resend' });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    console.error('Resend proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
