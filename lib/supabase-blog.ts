import { createClient } from '@supabase/supabase-js';

// Configured via Vercel env vars: BLOG_SUPABASE_URL and BLOG_SUPABASE_KEY
const SUPABASE_URL = process.env.BLOG_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ayvkclqqdonyhrqvahdh.supabase.co';
const SUPABASE_KEY = process.env.BLOG_SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseBlog = createClient(SUPABASE_URL, SUPABASE_KEY);

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
