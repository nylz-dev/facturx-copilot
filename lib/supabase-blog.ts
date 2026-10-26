import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.BLOG_SUPABASE_URL || 'https://ayvkclqqdonyhrqvahdh.supabase.co';
const SUPABASE_KEY = process.env.BLOG_SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// null when no key is configured: the blog then serves local articles only.
export const supabaseBlog = SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

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
