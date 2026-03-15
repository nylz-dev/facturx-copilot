import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe non configuré.' }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, { apiVersion: '2026-02-25.clover' });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.facturexpro.fr';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Conversion Factur-X unique',
              description: '1 conversion de facture PDF au format Factur-X conforme EN16931',
            },
            unit_amount: 100, // 1€
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/?token={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
      locale: 'fr',
      allow_promotion_codes: false,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur interne';
    console.error('[checkout-single]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
