import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllPosts, formatDate } from '@/lib/blog';
import { SITE_URL, JsonLd } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Blog FacturXPro — Facturation électronique & Factur-X',
  description:
    'Guides pratiques sur la facturation électronique obligatoire, la norme Factur-X, le calendrier 2026-2027 et la mise en conformité des PME françaises.',
  alternates: { canonical: '/blog' },
  openGraph: { url: `${SITE_URL}/blog`, type: 'website', images: ['/opengraph-image'] },
};

export const revalidate = 3600;

export default async function BlogPage() {
  const articles = await getAllPosts();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Blog FacturXPro',
          url: `${SITE_URL}/blog`,
          inLanguage: 'fr-FR',
          blogPost: articles.map((a) => ({
            '@type': 'BlogPosting',
            headline: a.title,
            url: `${SITE_URL}/blog/${a.slug}`,
            datePublished: a.publishedAt,
          })),
        }}
      />

      <header className="border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🧾</span>
            <span className="font-bold text-slate-900 text-xl tracking-tight">
              FacturX<span className="text-blue-600">Pro</span>
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-colors">Accueil</Link>
            <Link href="/blog" className="text-slate-900 font-semibold">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Blog FacturXPro</h1>
          <p className="text-slate-500 text-lg">
            Tout comprendre de la facturation électronique obligatoire et de la norme Factur-X : calendrier, mentions, formats et outils.
          </p>
        </div>

        {articles.length === 0 ? (
          <p className="text-slate-400">Aucun article disponible pour le moment.</p>
        ) : (
          <div className="space-y-8">
            {articles.map((article) => (
              <article key={article.slug} className="border-b border-slate-100 pb-8 last:border-0">
                <span className="inline-block text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2 bg-blue-50 px-2 py-0.5 rounded">
                  {article.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mb-2 leading-snug">
                  <Link href={`/blog/${article.slug}`} className="hover:text-blue-600 transition-colors">
                    {article.title}
                  </Link>
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-3">{article.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Par Dany G.</span>
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                  <Link href={`/blog/${article.slug}`} className="ml-auto text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm">
                    Lire &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-100 mt-16 py-10 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} FacturXPro. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
