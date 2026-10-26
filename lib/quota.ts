/**
 * Persistent conversion quota, backed by Postgres (Supabase).
 * Atomic check-and-increment via the facturx_consume_quota RPC —
 * survives cold starts and serverless instance churn, unlike an
 * in-memory counter.
 */
import { getSupabaseAdmin } from './supabase-admin';

export const FREE_LIMIT = 3;

function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7); // "2026-09"
}

export async function consumeQuota(
  identity: string,
  limit: number = FREE_LIMIT
): Promise<{ allowed: boolean; used: number }> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc('facturx_consume_quota', {
    p_identity: identity,
    p_period: currentPeriod(),
    p_limit: limit,
  });

  if (error) {
    throw new Error(`Vérification du quota impossible : ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  return { allowed: row.allowed, used: row.used };
}
