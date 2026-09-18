import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

/**
 * GET /api/licence?session_id=cs_...
 * Called from /success right after a subscription checkout completes.
 * Resolves the paying customer's email via Stripe, then looks up the
 * licence key the webhook should already have written to
 * facturx_subscribers. The webhook can lag the redirect by a second or
 * two, so this is retried briefly before giving up.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId || !sessionId.startsWith('cs_')) {
    return NextResponse.json({ error: 'session_id invalide.' }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Configuration serveur manquante.' }, { status: 500 });
  }

  try {
    const stripe = new Stripe(secretKey, { apiVersion: '2026-02-25.clover' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Paiement non confirmé.' }, { status: 402 });
    }

    const email = session.customer_details?.email ?? session.customer_email;
    if (!email) {
      return NextResponse.json({ error: 'Email introuvable pour cette session.' }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();

    // The Stripe webhook writes the subscriber row asynchronously —
    // give it a few short retries before reporting "not ready yet".
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data } = await supabase
        .from('facturx_subscribers')
        .select('licence_key, plan, status')
        .eq('email', email)
        .maybeSingle();

      if (data?.licence_key) {
        return NextResponse.json({
          licenceKey: data.licence_key,
          plan: data.plan,
          status: data.status,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return NextResponse.json(
      { error: "Abonnement en cours d'activation, réessayez dans quelques secondes." },
      { status: 202 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur interne';
    console.error('[licence]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
