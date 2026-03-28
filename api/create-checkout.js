// api/create-checkout.js
// Crée une session Stripe Checkout — pur Node.js, pas d'import

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const { priceId, plan, billing } = req.body;

  if (!priceId) return res.status(400).json({ error: 'priceId manquant' });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alma-plus.vercel.app';

  try {
    const res2 = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'payment_method_types[]': 'card',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'success_url': `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}&billing=${billing}`,
        'cancel_url': `${siteUrl}/pricing`,
        'allow_promotion_codes': 'true',
        'locale': 'fr',
        'metadata[plan]': plan,
        'metadata[billing]': billing,
        'subscription_data[metadata][plan]': plan,
        'subscription_data[metadata][billing]': billing,
      }).toString()
    });

    if (!res2.ok) {
      const err = await res2.json();
      return res.status(res2.status).json({ error: err.error?.message || 'erreur stripe' });
    }

    const session = await res2.json();
    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: err.message });
  }
};
