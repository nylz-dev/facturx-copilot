'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/lib/blog-utils';

// "Dans cet article": jumps to each section and highlights the one being read.
export default function ArticleToc({ items, className = '' }: { items: TocItem[]; className?: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const targets = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -65% 0px' },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Sommaire de l'article" className={className}>
      <ol className="space-y-1 border-l border-slate-200">
        {items
          .filter((i) => i.level === 2)
          .map((item) => {
            const current = active === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={current ? 'location' : undefined}
                  className={`-ml-px block border-l-2 py-1.5 pl-4 pr-2 text-sm leading-snug transition ${
                    current ? 'border-blue-600 font-medium text-slate-900' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                  }`}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
      </ol>
    </nav>
  );
}
