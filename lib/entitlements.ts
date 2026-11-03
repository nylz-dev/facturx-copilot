/**
 * Licence key entitlements — no magic link, just a UUID handed to the
 * subscriber (see /api/licence) and sent back as the `x-licence-key`
 * header on every conversion request.
 */
import { getSupabaseAdmin } from './supabase-admin';
import { PLAN_LIMITS, SubscriptionPlan } from './stripe-plans';

export interface Entitlement {
  email: string;
  plan: SubscriptionPlan;
  status: string;
  limit: number; // conversions/month; Infinity for unmetered plans
}

export async function getEntitlementByLicenceKey(
  licenceKey: string | null | undefined
): Promise<Entitlement | null> {
  if (!licenceKey) return null;

  // No store configured: a licence cannot be verified, so none is granted.
  // The caller falls back to the free quota rather than to unmetered access.
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('facturx_subscribers')
    .select('email, plan, status')
    .eq('licence_key', licenceKey)
    .maybeSingle();

  if (error || !data || data.status !== 'active') return null;

  const plan = data.plan as SubscriptionPlan;
  return {
    email: data.email,
    plan,
    status: data.status,
    limit: PLAN_LIMITS[plan] ?? 0,
  };
}
