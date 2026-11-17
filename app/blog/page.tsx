import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, FileCheck2 } from 'lucide-react';
import { getAllPosts, getCategories, toSummary } from '@/lib/blog';
import { SITE_URL, JsonLd } from '@/lib/site';
import BlogExplorer from '@/components/blog/BlogExplorer';
import BlogFooter from '@/components/blog/BlogFooter';
import BlogHeader from '@/components/blog/BlogHeader';

export const metadata: Metadata = {
  title: 'Blog FacturXPro — Facturation électronique & Factur-X',
  description:
    'Guides pratiques sur la facturation électronique obligatoire, la norme Factur-X, le calendrier 2026-2027 et la mise en conformité des PME françaises.',
  alternates: { canonical: '/blog' },
  openGraph: { url: `${SITE_URL}/blog`, type: 'website', images: ['/opengraph-image'] },
};

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Blog FacturXPro',
          url: `${SITE_URL}/blog`,
          inLanguage: 'fr-FR',
          blogPost: posts.map((a) => ({
            '@type': 'BlogPosting',
            headline: a.title,
            url: `${SITE_URL}/blog/${a.slug}`,
            datePublished: a.publishedAt,
          })),
        }}
      />

      <BlogHeader />

      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-blue-50 via-sky-50/60 to-white">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-14 md:pb-20 md:pt-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-700">
            <FileCheck2 size={13} aria-hidden /> Facturation électronique &amp; Factur-X
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Le blog <span className="text-blue-600">FacturXPro</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
            Tout comprendre de la facturation électronique obligatoire et de la norme Factur-X : calendrier, mentions, formats et outils.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        {posts.length === 0 ? (
          <p className="text-slate-400">Aucun article disponible pour le moment.</p>
        ) : (
          <BlogExplorer posts={posts.map(toSummary)} categories={getCategories(posts)} />
        )}

        <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 md:flex-row md:items-center md:p-10">
          <div>
            <p className="text-xl font-bold text-slate-900 md:text-2xl">Convertissez une facture PDF en Factur-X</p>
            <p className="mt-2 text-slate-600">Gratuit pour 3 factures par mois, sans inscription.</p>
          </div>
          <Link href="/#upload" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700">
            Essayer FacturXPro <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
