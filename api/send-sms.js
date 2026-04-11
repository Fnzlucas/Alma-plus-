// api/send-sms.js
// Envoie un SMS via OVH + décrémente les crédits Supabase

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const { phone, message, senderName } = req.body;
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!phone || !message) return res.status(400).json({ error: 'phone et message requis' });
  if (!token) return res.status(401).json({ error: 'non autorisé' });

  try {
    // 1. Vérifier l'user et ses crédits
    const profileRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=id,sms_credits`, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${token}`,
      }
    });
    const profiles = await profileRes.json();
    const profile = profiles?.[0];

    if (!profile) return res.status(401).json({ error: 'utilisateur introuvable' });
    if (!profile.sms_credits || profile.sms_credits <= 0) {
      return res.status(402).json({ error: 'crédits SMS insuffisants', credits: 0 });
    }

    // 2. Envoyer le SMS via OVH
    const ovhAppKey = process.env.OVH_APP_KEY;
    const ovhAppSecret = process.env.OVH_APP_SECRET;
    const ovhConsumerKey = process.env.OVH_CONSUMER_KEY;
    const ovhServiceName = process.env.OVH_SERVICE_NAME;
    const sender = (senderName || 'Huntlist').replace(/\s/g, '').slice(0, 11);

    // Signature OVH
    const timestamp = Math.round(Date.now() / 1000);
    const url = `https://eu.api.ovh.com/1.0/sms/${ovhServiceName}/jobs`;
    const body = JSON.stringify({
      charset: 'UTF-8',
      class: 'phoneDisplay',
      coding: '7bit',
      message,
      noStopClause: false,
      priority: 'high',
      receivers: [phone],
      sender,
      senderForResponse: false,
      validityPeriod: 2880,
    });

    const toSign = `${ovhAppSecret}+${ovhConsumerKey}+GET+${url}+${body}+${timestamp}`;
    const crypto = require('crypto');
    const signature = '$1$' + crypto.createHash('sha1').update(toSign).digest('hex');

    const smsRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ovh-Application': ovhAppKey,
        'X-Ovh-Consumer': ovhConsumerKey,
        'X-Ovh-Timestamp': timestamp.toString(),
        'X-Ovh-Signature': signature,
      },
      body,
    });

    if (!smsRes.ok) {
      const err = await smsRes.json();
      throw new Error(err.message || 'erreur OVH');
    }

    // 3. Décrémenter les crédits
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${profile.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ sms_credits: profile.sms_credits - 1 }),
    });

    return res.status(200).json({ success: true, creditsLeft: profile.sms_credits - 1 });

  } catch(e) {
    console.error('SMS error:', e);
    return res.status(500).json({ error: e.message });
  }
};
