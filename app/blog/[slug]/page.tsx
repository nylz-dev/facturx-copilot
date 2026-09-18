import { supabaseBlog } from '@/lib/supabase-blog';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabaseBlog
    .from('articles')
    .select('title, excerpt, published_at')
    .eq('slug', params.slug)
    .eq('site_id', 'facturexpro')
    .single();

  if (!data) return { title: 'Article introuvable' };

  const url = `${SITE_URL}/blog/${params.slug}`;

  return {
    title: `${data.title} — ${SITE_NAME}`,
    description: data.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: data.title,
      description: data.excerpt ?? undefined,
      url,
      siteName: SITE_NAME,
      locale: 'fr_FR',
      type: 'article',
      publishedTime: data.published_at ?? undefined,
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: data.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.excerpt ?? undefined,
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function ArticlePage({ params }: Props) {
  const { data: article } = await supabaseBlog
    .from('articles')
    .select('*')
    .eq('slug', params.slug)
    .eq('site_id', 'facturexpro')
    .eq('status', 'published')
    .single();

  if (!article) notFound();

  const url = `${SITE_URL}/blog/${params.slug}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt ?? undefined,
    datePublished: article.published_at ?? undefined,
    dateModified: article.published_at ?? undefined,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'fr',
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: article.title, item: url },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="bg-orange-500 text-white text-sm font-semibold text-center py-2 px-4">
        Réception Factur-X obligatoire depuis le 1er septembre 2026 — émission pour les PME/TPE dès 2027
      </div>

      <header className="border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🧾</span>
            <span className="font-bold text-slate-900 text-xl tracking-tight">
              FacturX<span className="text-blue-600">Pro</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-colors">Accueil</Link>
            <Link href="/blog" className="hover:text-slate-900 transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-6">
          <Link href="/blog" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
            &larr; Retour au blog
          </Link>
        </div>

        {article.category && (
          <span className="inline-block text-xs font-semibold text-blue-600 uppercase tracking-widest mb-4 bg-blue-50 px-2 py-0.5 rounded">
            {article.category}
          </span>
        )}

        <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-4">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-slate-400 mb-10 pb-8 border-b border-slate-100">
          <span>Par Dany G.</span>
          {article.published_at && (
            <time dateTime={article.published_at}>
              {formatDate(article.published_at)}
            </time>
          )}
        </div>

        <article
          className="prose prose-slate max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between">
          <Link href="/blog" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
            &larr; Retour au blog
          </Link>
          <Link
            href="/#upload"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Essayer FacturXPro
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-100 mt-16 py-10 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} FacturXPro. Tous droits reserves.
        </div>
      </footer>
    </div>
  );
}
