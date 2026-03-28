// app/api/webhook/route.js
// Webhook Stripe — Next.js App Router

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  switch (event.type) {

    // ✅ Paiement réussi
    case 'checkout.session.completed': {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      const plan = session.metadata?.plan || session.subscription_data?.metadata?.plan || 'starter';
      const billing = session.metadata?.billing || session.subscription_data?.metadata?.billing || 'monthly';

      console.log(`✅ Paiement — ${customerEmail} — plan ${plan} (${billing})`);

      if (customerEmail) {
        const { error } = await supabase
          .from('profiles')
          .update({
            plan,
            billing,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            subscribed_at: new Date().toISOString(),
          })
          .eq('email', customerEmail);

        if (error) console.error('Supabase update error:', error);
      }
      break;
    }

    // 💳 Renouvellement payé
    case 'invoice.paid': {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          last_payment: new Date().toISOString()
        })
        .eq('stripe_customer_id', customerId);
      break;
    }

    // ❌ Paiement échoué
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      await supabase
        .from('profiles')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId);
      break;
    }

    // 🚫 Abonnement annulé
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      await supabase
        .from('profiles')
        .update({ subscription_status: 'canceled', plan: null })
        .eq('stripe_customer_id', customerId);
      break;
    }

    default:
      console.log(`Événement non géré : ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
