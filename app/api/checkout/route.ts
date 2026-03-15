import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const PRICE_IDS: Record<string, string> = {
  pro: "price_1TBKOaCSseW7QqXy6oTvxuNI",
  cabinet: "price_1TBKOhCSseW7QqXyzSoliJG5",
};

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();
    const priceId = PRICE_IDS[plan];

    if (!priceId) {
      return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Stripe non configuré." }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.facturexpro.fr";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
      locale: "fr",
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[checkout]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
