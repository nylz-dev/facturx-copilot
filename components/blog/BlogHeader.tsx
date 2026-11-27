import Link from 'next/link';

// Same header as the home page: the blog is part of the site.
export default function BlogHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🧾</span>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            FacturX<span className="text-blue-600">Pro</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-slate-600">
          <Link href="/" className="transition-colors hover:text-slate-900">Accueil</Link>
          <Link href="/blog" className="font-semibold text-slate-900">Blog</Link>
        </nav>
      </div>
    </header>
  );
}
