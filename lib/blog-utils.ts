// Helpers shared by the blog UI. No Node APIs here: client components import this file too.

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

// What the listing needs about a post; plain data so it can cross to client components.
export interface PostSummary {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  dateLabel: string;
  readingMinutes: number;
  cover?: string;
}

const COMBINING_MARKS = /[̀-ͯ]/g;

export function normalize(text: string): string {
  return text.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
}

export function slugify(text: string): string {
  return normalize(text).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'section';
}

export function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&(?:#39|apos);/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function readingMinutes(html: string, wordsPerMinute = 220): number {
  const words = stripTags(html).split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}

// A leading <h1> repeats the page title: drop it so each page keeps a single h1.
export function stripLeadingH1(html: string): string {
  return html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '');
}

// Adds an id to every h2/h3 (anchor links + table of contents) and returns the heading list.
export function addHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const used = new Map<string, number>();
  const toc: TocItem[] = [];
  const out = html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g, (match, level: string, attrs: string | undefined, inner: string) => {
    if (attrs && /\sid=/.test(attrs)) return match;
    const text = stripTags(inner);
    let id = slugify(text);
    const seen = used.get(id) ?? 0;
    used.set(id, seen + 1);
    if (seen) id = `${id}-${seen + 1}`;
    toc.push({ id, text, level: Number(level) as 2 | 3 });
    return `<h${level}${attrs ?? ''} id="${id}">${inner}</h${level}>`;
  });
  return { html: out, toc };
}

// Wraps an opening "En bref" / "L'essentiel" section in a callout box (styled in globals.css).
export function wrapKeyTakeaways(html: string): string {
  return html.replace(
    /(<h2[^>]*>\s*(?:En bref|L(?:'|’|&#39;)essentiel|À retenir|Résumé)[^<]*<\/h2>)([\s\S]*?)(?=<h2[\s>]|$)/i,
    (_m, heading: string, body: string) => `<div class="post-callout">${heading}${body}</div>`,
  );
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}
