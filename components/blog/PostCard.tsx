import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import PostCover from './PostCover';
import type { PostSummary } from '@/lib/blog-utils';

export default function PostCard({ post, priority = false }: { post: PostSummary; priority?: boolean }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_24px_50px_-24px_rgba(15,23,42,0.35)]">
      <div className="relative">
        <PostCover slug={post.slug} category={post.category} title={post.title} cover={post.cover} priority={priority} className="relative aspect-[16/9] w-full" />
        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          {post.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-3 text-lg font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-600">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{post.description}</p>
        <div className="mt-auto flex items-center gap-2 pt-5 text-xs text-slate-500">
          <time dateTime={post.publishedAt}>{post.dateLabel}</time>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} aria-hidden /> {post.readingMinutes} min
          </span>
          <ArrowUpRight size={16} aria-hidden className="ml-auto text-slate-400 transition group-hover:text-blue-600" />
        </div>
      </div>
    </article>
  );
}
