'use client';

import { useState, useCallback, DragEvent, ChangeEvent } from 'react';

interface UploadResult {
  fileName: string;
  invoiceNumber: string;
  totalTTC: string;
  blobUrl: string;
}

type Step = 'idle' | 'uploading' | 'extracting' | 'generating' | 'done' | 'error';

const STEP_LABELS: Record<Step, string> = {
  idle: '',
  uploading: 'Lecture du PDF...',
  extracting: 'Extraction des données par IA...',
  generating: 'Génération du XML Factur-X...',
  done: 'Terminé !',
  error: 'Erreur',
};

export default function UploadZone() {
  const [step, setStep] = useState<Step>('idle');
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const process = useCallback(async (file: File) => {
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

    try {
      setStep('extracting');
      const res = await fetch('/api/convert', { method: 'POST', body: formData });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Erreur serveur');
      }

      setStep('generating');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const invoiceNumber = res.headers.get('X-Invoice-Number') ?? 'N/A';
      const totalTTC = res.headers.get('X-Total-TTC') ?? 'N/A';

      setResult({
        fileName: `facturx_${invoiceNumber}.pdf`,
        invoiceNumber,
        totalTTC,
        blobUrl,
      });
      setStep('done');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue');
      setStep('error');
    }
  }, []);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) process(file);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) process(file);
  };

  const reset = () => {
    setStep('idle');
    setResult(null);
    setErrorMsg('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
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
        </div>
      )}

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
