// api/webhook.js
// Webhook Stripe — pur Node.js, pas d'import, compatible HTML statique + Vercel

const crypto = require('crypto');

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifyStripeSignature(payload, sig, secret) {
  const parts = sig.split(',').reduce((acc, part) => {
    const [key, val] = part.split('=');
    acc[key] = val;
    return acc;
  }, {});

  const timestamp = parts['t'];
  const signatures = sig.split(',')
    .filter(p => p.startsWith('v1='))
    .map(p => p.replace('v1=', ''));

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  return signatures.some(s => crypto.timingSafeEqual(
    Buffer.from(s, 'hex'),
    Buffer.from(expectedSig, 'hex')
  ));
}

async function updateSupabase(table, match, data) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?${match}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Supabase error:', err);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  // Vérifier la signature Stripe
  let valid = false;
  try {
    valid = verifyStripeSignature(rawBody.toString(), sig, secret);
  } catch (err) {
    return res.status(400).json({ error: 'signature invalide' });
  }

  if (!valid) {
    return res.status(400).json({ error: 'signature invalide' });
  }

  // Parser l'événement
  let event;
  try {
    event = JSON.parse(rawBody.toString());
  } catch (err) {
    return res.status(400).json({ error: 'json invalide' });
  }

  console.log(`Stripe event: ${event.type}`);

  switch (event.type) {

    // ✅ Paiement réussi
    case 'checkout.session.completed': {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      const plan = session.metadata?.plan || 'starter';
      const billing = session.metadata?.billing || 'monthly';

      console.log(`✅ Paiement — ${customerEmail} — plan ${plan} (${billing})`);

      if (customerEmail) {
        await updateSupabase('profiles', `email=eq.${encodeURIComponent(customerEmail)}`, {
          plan,
          billing,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: 'active',
          subscribed_at: new Date().toISOString(),
        });
      }
      break;
    }

    // 💳 Renouvellement payé
    case 'invoice.paid': {
      const customerId = event.data.object.customer;
      await updateSupabase('profiles', `stripe_customer_id=eq.${customerId}`, {
        subscription_status: 'active',
        last_payment: new Date().toISOString()
      });
      break;
    }

    // ❌ Paiement échoué
    case 'invoice.payment_failed': {
      const customerId = event.data.object.customer;
      await updateSupabase('profiles', `stripe_customer_id=eq.${customerId}`, {
        subscription_status: 'past_due'
      });
      break;
    }

    // 🚫 Abonnement annulé
    case 'customer.subscription.deleted': {
      const customerId = event.data.object.customer;
      await updateSupabase('profiles', `stripe_customer_id=eq.${customerId}`, {
        subscription_status: 'canceled',
        plan: null
      });
      break;
    }

    default:
      console.log(`Événement non géré : ${event.type}`);
  }

  return res.status(200).json({ received: true });
};
