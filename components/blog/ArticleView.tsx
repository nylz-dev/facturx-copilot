import Link from 'next/link';
import { ArrowRight, Clock, Share2 } from 'lucide-react';
import PostCard from './PostCard';
import PostCover from './PostCover';
import ArticleToc from './ArticleToc';
import CopyLinkButton from './CopyLinkButton';
import ReadingProgress from './ReadingProgress';
import type { PostSummary, TocItem } from '@/lib/blog-utils';

export interface ArticleData {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  cover?: string;
  html: string;
  toc: TocItem[];
}

interface Props {
  post: ArticleData;
  related: PostSummary[];
  url: string;
  crumbs: { label: string; href: string }[];
  author: { name: string; role: string; initials: string };
  cta: { title: string; text: string; label: string; href: string };
}

const PROSE = [
  'prose prose-slate prose-lg max-w-none',
  'prose-headings:scroll-mt-28 prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900',
  'prose-h2:mt-14 prose-h2:text-2xl md:prose-h2:text-3xl prose-h3:mt-8 prose-h3:text-xl',
  'prose-p:leading-8 prose-p:text-slate-700 prose-li:text-slate-700 prose-li:marker:text-slate-400 prose-strong:text-slate-900',
  'prose-a:font-medium prose-a:text-blue-600 prose-a:underline-offset-4 hover:prose-a:text-blue-700',
  'prose-blockquote:rounded-r-xl prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-slate-700',
  'prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:text-blue-800 prose-code:before:content-none prose-code:after:content-none',
  'prose-hr:border-slate-200 prose-img:rounded-2xl prose-th:text-slate-900 prose-td:text-slate-700',
  '[&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto',
  '[&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none',
].join(' ');

function longDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function CtaCard({ cta, compact = false }: { cta: Props['cta']; compact?: boolean }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
      <p className={`font-semibold text-slate-900 ${compact ? 'text-base' : 'text-lg'}`}>{cta.title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{cta.text}</p>
      <Link
        href={cta.href}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        {cta.label} <ArrowRight size={16} aria-hidden />
      </Link>
    </div>
  );
}

export default function ArticleView({ post, related, url, crumbs, author, cta }: Props) {
  const sections = post.toc.filter((t) => t.level === 2);
  const showToc = sections.length >= 3;
  const updated = post.updatedAt && post.updatedAt.slice(0, 10) !== post.publishedAt.slice(0, 10);

  return (
    <>
      <ReadingProgress />

      <header className="mx-auto max-w-[1100px] px-6 pt-10 md:pt-14">
        <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
          {crumbs.map((c) => (
            <span key={c.href} className="flex items-center gap-2">
              <Link href={c.href} className="transition hover:text-blue-600">
                {c.label}
              </Link>
              <span aria-hidden>/</span>
            </span>
          ))}
          <span className="text-slate-600">{post.category}</span>
        </nav>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold uppercase tracking-wider text-blue-700">{post.category}</span>
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <Clock size={13} aria-hidden /> {post.readingMinutes} min de lecture
          </span>
        </div>

        <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-[1.15] tracking-tight text-slate-900 md:text-5xl">{post.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600 md:text-xl">{post.description}</p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-bold text-white">{author.initials}</div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{author.name}</p>
              <p className="text-xs text-slate-500">
                {author.role} · <time dateTime={post.publishedAt}>{longDate(post.publishedAt)}</time>
                {updated && (
                  <>
                    {' '}
                    · Mis à jour le <time dateTime={post.updatedAt}>{longDate(post.updatedAt)}</time>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CopyLinkButton url={url} />
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              <Share2 size={14} aria-hidden /> Partager
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-10 grid max-w-[1100px] gap-12 px-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <PostCover
            slug={post.slug}
            category={post.category}
            title={post.title}
            cover={post.cover}
            priority
            sizes="(min-width: 1100px) 724px, 100vw"
            className="relative aspect-[16/9] w-full rounded-3xl border border-slate-200"
            iconSize={220}
          />

          {showToc && (
            <details className="group mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:hidden">
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:hidden">
                Dans cet article <span className="text-slate-500">({sections.length} sections)</span>
              </summary>
              <ArticleToc items={post.toc} className="mt-3" />
            </details>
          )}

          <div className={`${PROSE} mt-10`} dangerouslySetInnerHTML={{ __html: post.html }} />

          <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
            <span className="text-sm text-slate-500">Cet article vous a été utile ?</span>
            <CopyLinkButton url={url} />
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8">
            <p className="text-xl font-bold text-slate-900 md:text-2xl">{cta.title}</p>
            <p className="mt-2 max-w-xl leading-relaxed text-slate-600">{cta.text}</p>
            <Link
              href={cta.href}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {cta.label} <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {showToc && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Dans cet article</p>
                <ArticleToc items={post.toc} />
              </div>
            )}
            <CtaCard cta={cta} compact />
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-20 max-w-[1100px] px-6 pb-4">
          <h2 className="text-2xl font-bold text-slate-900">À lire aussi</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <PostCard key={r.slug} post={r} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
