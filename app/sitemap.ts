import { MetadataRoute } from 'next';
import { supabaseBlog } from '@/lib/supabase-blog';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/mentions-legales`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/rgpd`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // A missing key or an unreachable database must not break the sitemap —
  // Google would drop every URL, including the static ones.
  try {
    const { data: articles } = await supabaseBlog
      .from('articles')
      .select('slug, published_at')
      .eq('site_id', 'facturexpro')
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString());

    const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map((article) => ({
      url: `${SITE_URL}/blog/${article.slug}`,
      lastModified: article.published_at ? new Date(article.published_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    return [...staticRoutes, ...articleRoutes];
  } catch {
    return staticRoutes;
  }
}
