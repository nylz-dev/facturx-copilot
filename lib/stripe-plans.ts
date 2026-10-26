export type SubscriptionPlan = 'pro' | 'cabinet';

export const PRICE_IDS: Record<SubscriptionPlan, string> = {
  pro: 'price_1TBKOaCSseW7QqXy6oTvxuNI',
  cabinet: 'price_1TBKOhCSseW7QqXyzSoliJG5',
};

export const PRICE_TO_PLAN: Record<string, SubscriptionPlan> = Object.fromEntries(
  Object.entries(PRICE_IDS).map(([plan, priceId]) => [priceId, plan as SubscriptionPlan])
);

// Conversions allowed per calendar month. Cabinet is unmetered (API access).
export const PLAN_LIMITS: Record<SubscriptionPlan, number> = {
  pro: 100,
  cabinet: Infinity,
};
