/**
 * In-memory IP quota tracker.
 * Soft limit: 3 free conversions per IP per month.
 * Resets on cold start — acceptable for MVP.
 */

const quotaStore = new Map<string, number>();

function getKey(ip: string): string {
  const yearMonth = new Date().toISOString().slice(0, 7); // "2026-03"
  return `${ip}:${yearMonth}`;
}

export const FREE_LIMIT = 3;

export function getUsage(ip: string): number {
  return quotaStore.get(getKey(ip)) ?? 0;
}

export function isQuotaExceeded(ip: string): boolean {
  return getUsage(ip) >= FREE_LIMIT;
}

export function incrementUsage(ip: string): number {
  const key = getKey(ip);
  const current = quotaStore.get(key) ?? 0;
  const next = current + 1;
  quotaStore.set(key, next);
  return next;
}
