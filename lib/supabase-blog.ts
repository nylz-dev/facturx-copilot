import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.BLOG_SUPABASE_URL || 'https://ayvkclqqdonyhrqvahdh.supabase.co';

export interface Article {
  id: string;
  site_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  status: string;
  published_at: string;
  created_at: string;
}

let client: SupabaseClient | null = null;

/**
 * Lazily creates the blog Supabase client. Deferring creation until a page
 * actually renders keeps a missing key from crashing the whole Next.js
 * build — only the blog route fails, not the entire deploy.
 */
function getSupabaseBlog(): SupabaseClient {
  if (client) return client;

  const key = process.env.BLOG_SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('BLOG_SUPABASE_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY) manquante.');
  }

  client = createClient(SUPABASE_URL, key);
  return client;
}

// Proxy so existing call sites (`supabaseBlog.from(...)`) keep working
// without creating the client at import time.
export const supabaseBlog: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabaseBlog(), prop, receiver);
  },
});
