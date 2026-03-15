'use client';

import { useState, useCallback, useEffect, DragEvent, ChangeEvent } from 'react';

interface UploadResult {
  fileName: string;
  invoiceNumber: string;
  totalTTC: string;
  blobUrl: string;
  freeRemaining: number | null;
}

type Step = 'idle' | 'uploading' | 'extracting' | 'generating' | 'done' | 'error' | 'quota_exceeded';

const STEP_LABELS: Record<string, string> = {
  idle: '',
  uploading: 'Lecture du PDF...',
  extracting: 'Extraction des données par IA...',
  generating: 'Génération du XML Factur-X...',
  done: 'Terminé !',
  error: 'Erreur',
  quota_exceeded: 'Quota atteint',
};

const FREE_LIMIT = 3;

export default function UploadZone() {
  const [step, setStep] = useState<Step>('idle');
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<'single' | 'pro' | null>(null);

  // On mount: check for ?token= in URL (redirect back from Stripe 1€)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setActiveToken(token);
      // Clean URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const handleCheckout = async (plan: 'single' | 'pro' | 'cabinet') => {
    const isSingle = plan === 'single';
    setCheckoutLoading(isSingle ? 'single' : 'pro');
    try {
      const endpoint = isSingle ? '/api/checkout-single' : '/api/checkout';
      const body = isSingle ? undefined : JSON.stringify({ plan });
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: isSingle ? undefined : { 'Content-Type': 'application/json' },
        body,
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? 'Erreur lors du paiement.');
      }
    } catch {
      alert('Erreur réseau.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const processFile = useCallback(
    async (file: File, token?: string | null) => {
      if (!file || file.type !== 'application/pdf') {
        setErrorMsg('Veuillez déposer un fichier PDF valide.');
        setStep('error');
        return;
      }

      setResult(null);
      setErrorMsg('');
      setStep('uploading');

      const formData = new FormData();
      formData.append('pdf', file);
      if (token) {
        formData.append('token', token);
      }

      try {
        setStep('extracting');
        const res = await fetch('/api/convert', { method: 'POST', body: formData });

        if (res.status === 402) {
          const data = await res.json();
          if (data.code === 'quota_exceeded') {
            setStep('quota_exceeded');
            return;
          }
          if (data.code === 'token_invalid') {
            setActiveToken(null);
            setErrorMsg(data.error ?? 'Token invalide ou expiré.');
            setStep('error');
            return;
          }
          throw new Error(data.error ?? 'Paiement requis');
        }

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? 'Erreur serveur');
        }

        setStep('generating');
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        const invoiceNumber = res.headers.get('X-Invoice-Number') ?? 'N/A';
        const totalTTC = res.headers.get('X-Total-TTC') ?? 'N/A';
        const freeRemainingRaw = res.headers.get('X-Free-Remaining');
        const freeRemaining = freeRemainingRaw !== null ? parseInt(freeRemainingRaw, 10) : null;

        // Clear token after successful single use
        if (token) {
          setActiveToken(null);
        }

        setResult({ fileName: `facturx_${invoiceNumber}.pdf`, invoiceNumber, totalTTC, blobUrl, freeRemaining });
        setStep('done');
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue');
        setStep('error');
      }
    },
    []
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file, activeToken);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file, activeToken);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const reset = () => {
    setStep('idle');
    setResult(null);
    setErrorMsg('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Token active banner */}
      {activeToken && step === 'idle' && (
        <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
          <span className="text-2xl">🎟️</span>
          <div>
            <p className="font-semibold text-green-800">Token de conversion actif</p>
            <p className="text-green-600 text-xs">Déposez votre PDF — cette conversion est débloquée.</p>
          </div>
        </div>
      )}

      {/* ── Idle ── */}
      {step === 'idle' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
            dragging
              ? 'border-blue-500 bg-blue-50 scale-[1.01]'
              : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }`}
        >
          <label htmlFor="pdf-input" className="cursor-pointer">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-lg font-semibold text-slate-700">
              Déposez votre facture PDF ici
            </p>
            <p className="text-sm text-slate-500 mt-1">
              ou <span className="text-blue-600 underline">cliquez pour sélectionner</span>
            </p>
            <p className="text-xs text-slate-400 mt-3">PDF uniquement — max 10 Mo</p>
            {!activeToken && (
              <p className="text-xs text-slate-400 mt-1">{FREE_LIMIT} conversions gratuites / mois</p>
            )}
            <input
              id="pdf-input"
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={onFileChange}
            />
          </label>
        </div>
      )}

      {/* ── Loading ── */}
      {(['uploading', 'extracting', 'generating'] as Step[]).includes(step) && (
        <div className="border-2 border-blue-200 rounded-2xl p-12 text-center bg-blue-50">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-lg font-semibold text-blue-700">{STEP_LABELS[step]}</p>
          <div className="mt-4 flex justify-center gap-2">
            {(['uploading', 'extracting', 'generating'] as Step[]).map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full transition-all duration-500 ${
                  step === s
                    ? 'bg-blue-500'
                    : (['uploading', 'extracting', 'generating'] as Step[]).indexOf(s) <
                      (['uploading', 'extracting', 'generating'] as Step[]).indexOf(step)
                    ? 'bg-blue-300'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Done ── */}
      {step === 'done' && result && (
        <div className="border-2 border-green-300 rounded-2xl p-8 bg-green-50">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">✅</div>
            <h2 className="text-xl font-bold text-green-800">Facture Factur-X générée !</h2>
            <p className="text-sm text-green-600 mt-1">Conforme à la réforme du 1er septembre 2026</p>
          </div>

          <div className="bg-white rounded-xl p-4 mb-6 space-y-2 border border-green-200">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">N° facture</span>
              <span className="font-medium">{result.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total TTC</span>
              <span className="font-bold text-slate-800">
                {parseFloat(result.totalTTC).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Fichier</span>
              <span className="font-mono text-xs text-slate-600">{result.fileName}</span>
            </div>
            {result.freeRemaining !== null && result.freeRemaining >= 0 && (
              <div className="flex justify-between text-sm pt-1 border-t border-slate-100">
                <span className="text-slate-500">Conversions gratuites restantes</span>
                <span className={`font-semibold ${result.freeRemaining === 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {result.freeRemaining}/{FREE_LIMIT}
                </span>
              </div>
            )}
          </div>

          <a
            href={result.blobUrl}
            download={result.fileName}
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            ⬇️ Télécharger le PDF Factur-X
          </a>

          <button
            onClick={reset}
            className="mt-3 block w-full text-center text-slate-500 hover:text-slate-700 text-sm py-2 transition-colors"
          >
            Convertir une autre facture
          </button>

          {/* Upsell if running low */}
          {result.freeRemaining === 0 && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-center">
              <p className="font-semibold text-orange-800 mb-2">Quota mensuel atteint</p>
              <p className="text-orange-700 mb-3">Passez Pro pour des conversions illimitées.</p>
              <button
                onClick={() => handleCheckout('pro')}
                disabled={checkoutLoading !== null}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                {checkoutLoading === 'pro' ? '...' : 'Passer Pro — 19€/mois'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Quota exceeded ── */}
      {step === 'quota_exceeded' && (
        <div className="border-2 border-orange-300 rounded-2xl p-8 bg-orange-50">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">⛔</div>
            <h2 className="text-xl font-bold text-orange-900">Limite gratuite atteinte</h2>
            <p className="text-sm text-orange-700 mt-1">
              {FREE_LIMIT} conversions gratuites utilisées ce mois-ci
            </p>
          </div>

          <div className="space-y-3">
            {/* 1€ option */}
            <div className="bg-white border border-orange-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Conversion unique</p>
                  <p className="text-xs text-slate-500 mt-0.5">Débloquez cette conversion, sans abonnement</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-extrabold text-slate-900">1€</p>
                  <p className="text-xs text-slate-400">unique</p>
                </div>
              </div>
              <button
                onClick={() => handleCheckout('single')}
                disabled={checkoutLoading !== null}
                className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                {checkoutLoading === 'single' ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Redirection...
                  </span>
                ) : (
                  '→ Payer 1€ et convertir'
                )}
              </button>
            </div>

            {/* Pro subscription */}
            <div className="bg-blue-600 text-white rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-sm">Pro — Conversions illimitées</p>
                  <p className="text-xs text-blue-100 mt-0.5">+ Profil EN16931 avancé, support prioritaire</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-extrabold">19€</p>
                  <p className="text-xs text-blue-200">/mois</p>
                </div>
              </div>
              <button
                onClick={() => handleCheckout('pro')}
                disabled={checkoutLoading !== null}
                className="mt-3 w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                {checkoutLoading === 'pro' ? (
                  <span className="inline-flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Redirection...
                  </span>
                ) : (
                  '→ S\'abonner Pro'
                )}
              </button>
            </div>
          </div>

          <button
            onClick={reset}
            className="mt-4 block w-full text-center text-slate-400 hover:text-slate-600 text-xs py-2 transition-colors"
          >
            ← Retour
          </button>
        </div>
      )}

      {/* ── Error ── */}
      {step === 'error' && (
        <div className="border-2 border-red-300 rounded-2xl p-8 bg-red-50 text-center">
          <div className="text-4xl mb-3">❌</div>
          <p className="font-semibold text-red-700 mb-2">Conversion échouée</p>
          <p className="text-sm text-red-600 mb-6">{errorMsg}</p>
          <button
            onClick={reset}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-xl transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
}
