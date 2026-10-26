import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { supabaseBlog } from '@/lib/supabase-blog';

// Articles live in content/blog/*.md so the blog never depends on a database
// being up. Supabase articles (written by the agents) are merged in when the
// project is reachable; local files win on slug conflicts.

const SITE_ID = 'facturexpro';
const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

export interface Faq {
  q: string;
  a: string;
}

export interface Post {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  html: string;
  faq: Faq[];
}

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    data[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, '$1');
  }
  return { data, body: match[2] };
}

// A "## Questions fréquentes" section made of "### question" + paragraph pairs
// is also exposed as FAQPage structured data.
function extractFaq(body: string): Faq[] {
  const section = body.split(/^## Questions fréquentes\s*$/m)[1];
  if (!section) return [];
  const faq: Faq[] = [];
  for (const block of section.split(/^### /m).slice(1)) {
    const [q, ...rest] = block.split('\n');
    const a = rest.join(' ').split(/^## /m)[0].replace(/\s+/g, ' ').trim();
    if (q.trim() && a) faq.push({ q: q.trim(), a });
  }
  return faq;
}

function readLocalPosts(): Post[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const { data, body } = parseFrontmatter(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8'));
      return {
        slug: file.replace(/\.md$/, ''),
        title: data.title,
        description: data.description,
        category: data.category || 'Guide',
        publishedAt: data.date,
        updatedAt: data.updated || data.date,
        html: marked.parse(body, { async: false }) as string,
        faq: extractFaq(body),
      };
    });
}

async function readRemotePosts(): Promise<Post[]> {
  if (!supabaseBlog) return [];
  try {
    const { data, error } = await Promise.race([
      supabaseBlog
        .from('articles')
        .select('*')
        .eq('site_id', SITE_ID)
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString()),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
    ]);
    if (error || !data) return [];
    return data.map((a: any) => ({
      slug: a.slug,
      title: a.title,
      description: a.meta_description || a.excerpt || '',
      category: a.category || 'Guide',
      publishedAt: a.published_at || a.created_at,
      updatedAt: a.updated_at || a.published_at || a.created_at,
      html: /^\s*</.test(a.content) ? a.content : (marked.parse(a.content, { async: false }) as string),
      faq: [],
    }));
  } catch {
    return [];
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const local = readLocalPosts();
  const localSlugs = new Set(local.map((p) => p.slug));
  const remote = (await readRemotePosts()).filter((p) => !localSlugs.has(p.slug));
  return [...local, ...remote].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await getAllPosts()).find((p) => p.slug === slug);
}

// Same-category articles first, then the most recent ones: keeps internal links on topic.
export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const others = (await getAllPosts()).filter((p) => p.slug !== post.slug);
  return [...others.filter((p) => p.category === post.category), ...others.filter((p) => p.category !== post.category)].slice(0, limit);
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}
