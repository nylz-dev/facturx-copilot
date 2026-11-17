import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllPosts, getPost, getRelatedPosts, toSummary } from '@/lib/blog';
import ArticleView from '@/components/blog/ArticleView';
import BlogFooter from '@/components/blog/BlogFooter';
import BlogHeader from '@/components/blog/BlogHeader';
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

      <BlogHeader />
      <ArticleView
        post={post}
        related={related.map(toSummary)}
        url={url}
        crumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Blog', href: '/blog' },
        ]}
        author={{ name: 'Dany G.', role: 'Rédaction FacturXPro', initials: 'DG' }}
        cta={{
          title: 'Convertissez une facture PDF en Factur-X',
          text: 'Gratuit pour 3 factures par mois, sans inscription.',
          label: 'Essayer FacturXPro',
          href: '/#upload',
        }}
      />
      <BlogFooter />
    </div>
  );
}
