// api/claude.js
// Proxy sécurisé vers l'API Anthropic — clé jamais exposée côté client

export default async function handler(req, res) {
  // CORS — autoriser uniquement ton domaine
  res.setHeader('Access-Control-Allow-Origin', 'https://alma-plus.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const { messages, max_tokens = 1000, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages requis' });
  }

  try {
    const body = {
      model: 'claude-sonnet-4-5',
      max_tokens,
      messages,
    };
    if (system) body.system = system;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'erreur anthropic' });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('Claude proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
