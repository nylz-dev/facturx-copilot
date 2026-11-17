'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Search, X } from 'lucide-react';
import PostCard from './PostCard';
import PostCover from './PostCover';
import { normalize, type PostSummary } from '@/lib/blog-utils';

interface Props {
  posts: PostSummary[];
  categories: { name: string; count: number }[];
}

export default function BlogExplorer({ posts, categories }: Props) {
  const [category, setCategory] = useState('Tous');
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = normalize(query.trim());
    return posts.filter(
      (p) => (category === 'Tous' || p.category === category) && (!q || normalize(`${p.title} ${p.description} ${p.category}`).includes(q)),
    );
  }, [posts, category, query]);

  // The latest post is featured only while browsing everything.
  const browsing = category === 'Tous' && !query.trim();
  const featured = browsing ? results[0] : undefined;
  const grid = browsing ? results.slice(1) : results;

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filtrer par catégorie" className="flex flex-wrap gap-2">
          {[{ name: 'Tous', count: posts.length }, ...categories].map((c) => {
            const active = category === c.name;
            return (
              <button
                key={c.name}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c.name)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  active
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {c.name} <span className={active ? 'text-white/75' : 'text-slate-400'}>{c.count}</span>
              </button>
            );
          })}
        </div>
        <label className="relative block md:w-72 md:shrink-0">
          <span className="sr-only">Rechercher un article</span>
          <Search size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article…"
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Effacer la recherche" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
              <X size={16} />
            </button>
          )}
        </label>
      </div>

      <p className="sr-only" aria-live="polite">
        {results.length} article{results.length > 1 ? 's' : ''}
      </p>

      {featured && (
        <article className="group relative mt-8 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:border-blue-300 md:grid-cols-12">
          <div className="relative aspect-[16/10] md:col-span-7 md:aspect-auto md:min-h-[340px]">
            <PostCover
              slug={featured.slug}
              category={featured.category}
              title={featured.title}
              cover={featured.cover}
              priority
              sizes="(min-width: 768px) 58vw, 100vw"
              className="absolute inset-0"
              iconSize={260}
            />
          </div>
          <div className="flex flex-col justify-center p-6 md:col-span-5 md:p-10">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold uppercase tracking-wider text-blue-700">{featured.category}</span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Clock size={12} aria-hidden /> {featured.readingMinutes} min de lecture
              </span>
              <span className="text-slate-500">À la une</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
              <Link href={`/blog/${featured.slug}`} className="after:absolute after:inset-0 after:content-['']">
                {featured.title}
              </Link>
            </h2>
            <p className="mt-3 line-clamp-4 leading-relaxed text-slate-600">{featured.description}</p>
            <span className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-600 transition-all group-hover:gap-3">
              Lire l&apos;article <ArrowRight size={16} aria-hidden />
            </span>
          </div>
        </article>
      )}

      {grid.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {grid.map((post, i) => (
            <PostCard key={post.slug} post={post} priority={!featured && i < 3} />
          ))}
        </div>
      ) : (
        !featured && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Aucun article ne correspond à votre recherche.{' '}
            <button
              type="button"
              onClick={() => {
                setCategory('Tous');
                setQuery('');
              }}
              className="font-semibold text-blue-600 underline underline-offset-4"
            >
              Tout afficher
            </button>
          </div>
        )
      )}
    </div>
  );
}
