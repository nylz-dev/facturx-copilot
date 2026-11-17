'use client';

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copiez le lien :', url);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
    >
      {copied ? <Check size={14} className="text-emerald-600" aria-hidden /> : <Link2 size={14} aria-hidden />}
      {copied ? 'Lien copié' : 'Copier le lien'}
    </button>
  );
}
