import { createElement } from 'react';
import Image from 'next/image';
import { COVER_TONES, categoryIcon } from './cover-config';

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

interface Props {
  slug: string;
  category: string;
  title?: string;
  cover?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  iconSize?: number;
}

// A real image when the post has one, otherwise a generated cover: the hue follows the
// category (so a category is recognisable at a glance) and the layout varies per post.
// The parent card needs the "group" class for the hover effects, and the className must
// position the cover ("relative" with a size, or "absolute inset-0"): the image fills it.
export default function PostCover({ slug, category, title, cover, priority = false, sizes = '(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw', className = '', iconSize = 150 }: Props) {
  if (cover) {
    return (
      <div className={`overflow-hidden bg-slate-200 ${className}`}>
        <Image src={cover} alt="" fill sizes={sizes} priority={priority} className="object-cover object-[center_28%] transition-transform duration-700 group-hover:scale-[1.04]" />
      </div>
    );
  }

  const tone = COVER_TONES[(hash(category) + (hash(slug) % 2)) % COVER_TONES.length];
  const h = hash(slug);

  return (
    <div
      aria-hidden
      className={`overflow-hidden ${className}`}
      style={{
        backgroundImage: [
          `radial-gradient(circle at ${15 + (h % 60)}% ${(h >> 4) % 45}%, ${tone.glow}66 0, transparent 55%)`,
          `radial-gradient(circle at ${85 - ((h >> 8) % 40)}% 115%, ${tone.glow2}55 0, transparent 52%)`,
          `linear-gradient(135deg, ${tone.from}, ${tone.to})`,
        ].join(', '),
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
          maskImage: 'linear-gradient(to bottom right, black, transparent 72%)',
          WebkitMaskImage: 'linear-gradient(to bottom right, black, transparent 72%)',
        }}
      />
      {createElement(categoryIcon(category, title), {
        className: 'absolute -bottom-4 -right-3 text-white/20 transition-transform duration-700 group-hover:-rotate-3 group-hover:scale-110',
        size: iconSize,
        strokeWidth: 0.9,
      })}
    </div>
  );
}
