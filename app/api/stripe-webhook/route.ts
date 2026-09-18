import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PRICE_TO_PLAN } from '@/lib/stripe-plans';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    console.error('[stripe-webhook] STRIPE_SECRET_KEY ou STRIPE_WEBHOOK_SECRET manquant.');
    return NextResponse.json({ error: 'Configuration serveur manquante.' }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2026-02-25.clover' });
  const signature = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error('En-tête stripe-signature manquant.');
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Signature invalide';
    console.error('[stripe-webhook] Signature invalide:', msg);
    return NextResponse.json({ error: `Webhook signature verification failed: ${msg}` }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription' || !session.subscription) break;

        const email = session.customer_details?.email ?? session.customer_email;
        if (!email) {
          console.error('[stripe-webhook] checkout.session.completed sans email, session:', session.id);
          break;
        }

        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const item = subscription.items.data[0];
        const plan = item ? PRICE_TO_PLAN[item.price.id] : undefined;

        if (!plan) {
          console.error('[stripe-webhook] Price ID inconnu:', item?.price.id);
          break;
        }

        const { error } = await supabase.from('facturx_subscribers').upsert(
          {
            email,
            plan,
            status: 'active',
            stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
            stripe_subscription_id: subscription.id,
            current_period_end: item ? new Date(item.current_period_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        );
        if (error) console.error('[stripe-webhook] upsert subscriber failed:', error.message);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const item = subscription.items.data[0];
        const status =
          subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : subscription.status;

        const { error } = await supabase
          .from('facturx_subscribers')
          .update({
            status,
            current_period_end: item ? new Date(item.current_period_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        if (error) console.error('[stripe-webhook] update subscriber (updated) failed:', error.message);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const { error } = await supabase
          .from('facturx_subscribers')
          .update({ status: 'canceled', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subscription.id);
        if (error) console.error('[stripe-webhook] update subscriber (deleted) failed:', error.message);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionRef = invoice.parent?.subscription_details?.subscription;
        const subscriptionId = typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef?.id;

        if (subscriptionId) {
          const { error } = await supabase
            .from('facturx_subscribers')
            .update({ status: 'past_due', updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', subscriptionId);
          if (error) console.error('[stripe-webhook] update subscriber (payment_failed) failed:', error.message);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur interne';
    console.error('[stripe-webhook] Erreur de traitement:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
