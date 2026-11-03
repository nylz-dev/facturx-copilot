/**
 * Conversion quota.
 *
 * Backed by Postgres when SUPABASE_SERVICE_ROLE_KEY is configured: the
 * facturx_consume_quota RPC does an atomic check-and-increment, so the count
 * survives cold starts and is shared across serverless instances.
 *
 * Without that key it falls back to an in-memory counter. That is weaker —
 * a cold start resets it — but it is what this app did before, so the
 * fallback never grants more than the previous behaviour did.
 */
import { getSupabaseAdmin } from './supabase-admin';

export const FREE_LIMIT = 3;

function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7); // "2026-11"
}

const memoryCounters = new Map<string, number>();

function consumeInMemory(identity: string, limit: number): { allowed: boolean; used: number } {
  const key = `${identity}:${currentPeriod()}`;
  const used = memoryCounters.get(key) ?? 0;
  if (used >= limit) return { allowed: false, used };
  const next = used + 1;
  memoryCounters.set(key, next);
  return { allowed: true, used: next };
}

export async function consumeQuota(
  identity: string,
  limit: number = FREE_LIMIT
): Promise<{ allowed: boolean; used: number }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return consumeInMemory(identity, limit);

  const { data, error } = await supabase.rpc('facturx_consume_quota', {
    p_identity: identity,
    p_period: currentPeriod(),
    p_limit: limit,
  });

  // The store answered but refused: that is a real failure, not a reason to
  // wave the request through, so count it against the in-memory budget.
  if (error) {
    console.error('[facturx] facturx_consume_quota a échoué, repli en mémoire :', error.message);
    return consumeInMemory(identity, limit);
  }

  const row = Array.isArray(data) ? data[0] : data;
  return { allowed: row.allowed, used: row.used };
}
