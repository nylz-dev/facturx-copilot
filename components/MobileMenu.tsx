'use client';

import { useState } from 'react';

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
        aria-label="Menu"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-50 px-6 py-4 flex flex-col gap-4">
          <a href="#how" onClick={() => setOpen(false)} className="text-slate-700 font-medium hover:text-blue-600 transition-colors">Comment ça marche</a>
          <a href="#pricing" onClick={() => setOpen(false)} className="text-slate-700 font-medium hover:text-blue-600 transition-colors">Tarifs</a>
          <a href="#faq" onClick={() => setOpen(false)} className="text-slate-700 font-medium hover:text-blue-600 transition-colors">FAQ</a>
          <a href="#upload" onClick={() => setOpen(false)} className="bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-lg text-center hover:bg-blue-700 transition-colors">
            Essayer gratuitement →
          </a>
        </div>
      )}
    </div>
  );
}
