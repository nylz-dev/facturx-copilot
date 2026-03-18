import { supabaseBlog, Article } from '@/lib/supabase-blog';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog FacturXPro — Facturation electronique & Factur-X 2026',
  description: 'Guides pratiques sur la facturation electronique, la norme Factur-X et la mise en conformite obligatoire pour les PME françaises en 2026.',
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
            <Link href="/blog" className="text-slate-900 font-semibold">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Blog FacturXPro</h1>
          <p className="text-slate-500 text-lg">Tout savoir sur la facturation electronique et la norme Factur-X avant septembre 2026.</p>
        </div>

        {!articles || articles.length === 0 ? (
          <p className="text-slate-400">Aucun article disponible pour le moment.</p>
        ) : (
          <div className="space-y-8">
            {articles.map((article: Article) => (
              <article key={article.id} className="border-b border-slate-100 pb-8 last:border-0">
                {article.category && (
                  <span className="inline-block text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2 bg-blue-50 px-2 py-0.5 rounded">
                    {article.category}
                  </span>
                )}
                <h2 className="text-xl font-bold text-slate-900 mb-2 leading-snug">
                  <Link href={`/blog/${article.slug}`} className="hover:text-blue-600 transition-colors">
                    {article.title}
                  </Link>
                </h2>
                {article.excerpt && (
                  <p className="text-slate-500 text-sm leading-relaxed mb-3">{article.excerpt}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Par Dany G.</span>
                  {article.published_at && (
                    <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
                  )}
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
          &copy; {new Date().getFullYear()} FacturXPro. Tous droits reserves.
        </div>
      </footer>
    </div>
  );
}
