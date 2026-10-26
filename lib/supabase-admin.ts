import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the service_role key.
 * Required for quota/token/subscriber writes — the anon key cannot
 * bypass RLS on facturx_usage / facturx_tokens / facturx_subscribers.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.BLOG_SUPABASE_URL || 'https://ayvkclqqdonyhrqvahdh.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante — configuration serveur incomplète.');
  }

  client = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  return client;
}
