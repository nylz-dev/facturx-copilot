import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllPosts, getPost, getRelatedPosts, formatDate } from '@/lib/blog';
import { SITE_URL, SITE_NAME, JsonLd, organizationJsonLd } from '@/lib/site';

export const revalidate = 3600;
// Slugs not known at build time (new Supabase articles) are rendered on demand.
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (await getAllPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Article introuvable', robots: { index: false } };

  return {
    title: `${post.title} — ${SITE_NAME}`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      url: `${SITE_URL}/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: ['/opengraph-image'],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post);
  const url = `${SITE_URL}/blog/${post.slug}`;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            organizationJsonLd,
            {
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.description,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt,
              inLanguage: 'fr-FR',
              mainEntityOfPage: url,
              url,
              image: `${SITE_URL}/opengraph-image`,
              author: { '@type': 'Person', name: 'Dany G.' },
              publisher: { '@id': `${SITE_URL}/#organization` },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
                { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
                { '@type': 'ListItem', position: 3, name: post.title, item: url },
              ],
            },
            ...(post.faq.length
              ? [
                  {
                    '@type': 'FAQPage',
                    mainEntity: post.faq.map((f) => ({
                      '@type': 'Question',
                      name: f.q,
                      acceptedAnswer: { '@type': 'Answer', text: f.a },
                    })),
                  },
                ]
              : []),
          ],
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
            <Link href="/blog" className="hover:text-slate-900 transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-slate-400">
          <Link href="/" className="hover:text-blue-600">Accueil</Link> /{' '}
          <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        </nav>

        <span className="inline-block text-xs font-semibold text-blue-600 uppercase tracking-widest mb-4 bg-blue-50 px-2 py-0.5 rounded">
          {post.category}
        </span>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-10 pb-8 border-b border-slate-100">
          <span>Par Dany G.</span>
          <time dateTime={post.publishedAt}>Publié le {formatDate(post.publishedAt)}</time>
          {post.updatedAt !== post.publishedAt && (
            <time dateTime={post.updatedAt}>Mis à jour le {formatDate(post.updatedAt)}</time>
          )}
        </div>

        <article
          className="prose prose-slate max-w-none leading-relaxed prose-a:text-blue-600 prose-headings:scroll-mt-24"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <div className="mt-12 rounded-2xl bg-blue-50 border border-blue-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900">Convertissez une facture PDF en Factur-X</p>
            <p className="text-sm text-slate-500">Gratuit pour 3 factures par mois, sans inscription.</p>
          </div>
          <Link
            href="/#upload"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors text-center"
          >
            Essayer FacturXPro
          </Link>
        </div>

        {related.length > 0 && (
          <section className="mt-16 pt-8 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">À lire aussi</h2>
            <ul className="space-y-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/blog/${r.slug}`} className="text-blue-600 hover:text-blue-700">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
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
