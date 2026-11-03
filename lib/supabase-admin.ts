import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;
let warned = false;

/**
 * Server-only Supabase client using the service_role key, or null when the
 * key isn't configured.
 *
 * Returning null rather than throwing is deliberate: the quota and token
 * stores fall back to in-memory counters, which is exactly what this app did
 * before they were moved to Postgres. A missing key then costs persistence —
 * it no longer takes conversion down with a 500. Callers must still never
 * fall back to *granting* access they cannot verify.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (client) return client;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    if (!warned) {
      warned = true;
      console.warn(
        '[facturx] SUPABASE_SERVICE_ROLE_KEY absente : quota et tokens repassent en mémoire ' +
          '(remis à zéro à chaque cold start) et les clés de licence sont inopérantes.'
      );
    }
    return null;
  }

  const url = process.env.BLOG_SUPABASE_URL || 'https://ayvkclqqdonyhrqvahdh.supabase.co';
  client = createClient(url, serviceKey, { auth: { persistSession: false } });
  return client;
}

/** True when quota, tokens and licences are actually persisted. */
export function isPersistenceConfigured(): boolean {
  return getSupabaseAdmin() !== null;
}
