import { supabaseBlog } from '@/lib/supabase-blog';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog FacturXPro — Facturation electronique & Factur-X 2026',
  description: 'Tout ce que vous devez savoir sur la reforme Factur-X 2026, la facturation electronique obligatoire et la mise en conformite des PME françaises.',
};

export const revalidate = 3600;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPage() {
  const { data: articles } = await supabaseBlog
    .from('articles')
    .select('id, title, slug, excerpt, category, published_at')
    .eq('site_id', 'facturexpro')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="bg-orange-500 text-white text-sm font-semibold text-center py-2 px-4">
        Obligation legale : 1er septembre 2026 pour toutes les PME françaises
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
            <Link href="/blog" className="text-blue-600 font-medium">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <span className="inline-block text-xs font-semibold text-blue-600 uppercase tracking-widest mb-4 bg-blue-50 px-2 py-0.5 rounded">
            Ressources
          </span>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
            Blog FacturXPro
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl">
            Guides pratiques sur la facturation electronique, la reforme Factur-X 2026 et la mise en conformite des entreprises françaises.
          </p>
        </div>

        {articles && articles.length > 0 ? (
          <div className="grid gap-8">
            {articles.map((article: any) => (
              <article
                key={article.id}
                className="border border-slate-100 rounded-xl p-8 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  {article.category && (
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                      {article.category}
                    </span>
                  )}
                  {article.published_at && (
                    <time className="text-xs text-slate-400" dateTime={article.published_at}>
                      {formatDate(article.published_at)}
                    </time>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-3 leading-snug hover:text-blue-600 transition-colors">
                  <Link href={`/blog/${article.slug}`}>{article.title}</Link>
                </h2>
                {article.excerpt && (
                  <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                <Link
                  href={`/blog/${article.slug}`}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Lire l&apos;article &rarr;
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-16">Aucun article pour le moment.</p>
        )}
      </main>

      <footer className="border-t border-slate-100 mt-16 py-10 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} FacturXPro. Tous droits reserves.
        </div>
      </footer>
    </div>
  );
}
