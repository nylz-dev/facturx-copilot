/**
 * Single-use 1€ token verification.
 * Token = Stripe Checkout Session ID.
 * Usage is tracked in Postgres (facturx_tokens, unique constraint on
 * token) so it can't be replayed across serverless instances or after
 * a cold start.
 */

import Stripe from 'stripe';
import { getSupabaseAdmin } from './supabase-admin';

export async function verifyAndConsumeToken(
  sessionId: string,
  stripeSecretKey: string
): Promise<{ valid: boolean; error?: string }> {
  // Basic format check
  if (!sessionId || !sessionId.startsWith('cs_')) {
    return { valid: false, error: 'Token invalide.' };
  }

  try {
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-02-25.clover' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Must be paid
    if (session.payment_status !== 'paid') {
      return { valid: false, error: 'Paiement non complété.' };
    }

    // Must be payment mode (not subscription)
    if (session.mode !== 'payment') {
      return { valid: false, error: 'Type de session invalide.' };
    }

    // Verify amount: must be 1€ (100 cents)
    const amount = session.amount_total ?? 0;
    if (amount !== 100) {
      return { valid: false, error: 'Montant de paiement invalide.' };
    }

    // Atomically mark as used — fails if already consumed
    const supabase = getSupabaseAdmin();
    const { data: consumed, error } = await supabase.rpc('facturx_consume_token', {
      p_token: sessionId,
    });

    if (error) {
      return { valid: false, error: 'Erreur de vérification du token.' };
    }
    if (!consumed) {
      return { valid: false, error: 'Token déjà utilisé.' };
    }

    return { valid: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur Stripe';
    return { valid: false, error: msg };
  }
}
