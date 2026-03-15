export default function SuccessPage() {
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
        <p className="text-slate-400 text-sm mb-8">
          Un email de confirmation vous a été envoyé par Stripe.
        </p>
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
