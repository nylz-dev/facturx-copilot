/**
 * Single-use 1€ token management.
 * Token = Stripe Checkout Session ID.
 * Usage tracked in module-scope Set (resets on cold start — acceptable for MVP).
 */

import Stripe from 'stripe';

const usedTokens = new Set<string>();

export async function verifyAndConsumeToken(
  sessionId: string,
  stripeSecretKey: string
): Promise<{ valid: boolean; error?: string }> {
  // Basic format check
  if (!sessionId || !sessionId.startsWith('cs_')) {
    return { valid: false, error: 'Token invalide.' };
  }

  // Already used in this instance
  if (usedTokens.has(sessionId)) {
    return { valid: false, error: 'Token déjà utilisé.' };
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

    // Mark as used
    usedTokens.add(sessionId);
    return { valid: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur Stripe';
    return { valid: false, error: msg };
  }
}
