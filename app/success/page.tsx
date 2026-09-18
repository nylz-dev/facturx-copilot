'use client';

import { useEffect, useState } from 'react';

type Status = 'loading' | 'ready' | 'pending' | 'error';

export default function SuccessPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [licenceKey, setLicenceKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (!sessionId) {
      setStatus('error');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/licence?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (cancelled) return;

        if (res.ok && data.licenceKey) {
          setLicenceKey(data.licenceKey);
          setStatus('ready');
        } else if (res.status === 202) {
          setStatus('pending');
        } else {
          setStatus('error');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const copyKey = () => {
    if (!licenceKey) return;
    navigator.clipboard.writeText(licenceKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Paiement confirmé 🎉</h1>
        <p className="text-slate-500 mb-2">
          Bienvenue sur FacturXPro. Votre abonnement est actif.
        </p>

        {status === 'loading' && (
          <p className="text-slate-400 text-sm my-6">Récupération de votre clé de licence...</p>
        )}

        {status === 'pending' && (
          <p className="text-orange-500 text-sm my-6">
            Votre abonnement est en cours d'activation. Rafraîchissez cette page dans quelques instants.
          </p>
        )}

        {status === 'error' && (
          <p className="text-slate-400 text-sm my-6">
            Un email de confirmation vous a été envoyé par Stripe. Contactez{' '}
            <a href="mailto:contact@facturexpro.fr" className="text-blue-600 underline">contact@facturexpro.fr</a>{' '}
            si vous ne trouvez pas votre clé de licence.
          </p>
        )}

        {status === 'ready' && licenceKey && (
          <div className="my-6 text-left">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Votre clé de licence</p>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
              <code className="flex-1 text-xs text-slate-700 break-all">{licenceKey}</code>
              <button
                onClick={copyKey}
                className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Envoyez cette clé dans l'en-tête <code className="bg-slate-100 px-1 rounded">x-licence-key</code> de vos
              requêtes, ou collez-la sur la page d'accueil pour débloquer vos conversions.
            </p>
          </div>
        )}

        <a
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Commencer à convertir →
        </a>
      </div>
    </main>
  );
}
