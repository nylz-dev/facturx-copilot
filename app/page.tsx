import UploadZone from '@/components/UploadZone';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧾</span>
            <span className="font-bold text-slate-800 text-lg">FacturX Copilot</span>
          </div>
          <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-3 py-1 rounded-full">
            ⚡ Réforme 2026
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-full">
              <span>🇫🇷</span> Réforme facturation électronique 2026
            </div>
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-4 py-2 rounded-full">
              <span>🔒</span> Données traitées en France — RGPD natif
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
            Votre facture PDF devient<br />
            <span className="text-blue-600">Factur-X en 1 clic</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            À partir du <strong>1er septembre 2026</strong>, toutes les PME françaises devront
            émettre des factures au format hybride Factur-X. Soyez prêt maintenant.
          </p>
          <p className="text-sm text-slate-400 mt-3">
            Fonctionne avec tous les PDFs — natifs ET scannés. Propulsé par Mistral AI 🇫🇷
          </p>
        </div>

        {/* Upload Zone */}
        <UploadZone />

        {/* How it works */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold text-slate-800 mb-10">Comment ça marche ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📤',
                title: '1. Déposez votre PDF',
                desc: 'Glissez-déposez votre facture existante. N\'importe quel format de facture FR.',
              },
              {
                icon: '🤖',
                title: '2. L\'IA extrait les données',
                desc: 'Mistral AI (🇫🇷) lit votre facture — texte natif ou scan. Extrait vendeur, acheteur, lignes, TVA, IBAN.',
              },
              {
                icon: '✅',
                title: '3. Téléchargez le Factur-X',
                desc: 'PDF hybride avec XML Factur-X intégré, conforme PPF/PDP. Prêt à envoyer.',
              },
            ].map((step) => (
              <div key={step.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Urgency banner */}
        <div className="mt-16 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-8 text-center">
          <p className="text-3xl mb-3">⏰</p>
          <h2 className="text-xl font-bold text-orange-800 mb-2">
            J-quelques mois avant l'obligation légale
          </h2>
          <p className="text-orange-700 max-w-xl mx-auto text-sm">
            La Direction Générale des Finances Publiques impose le format Factur-X à partir du 1er septembre 2026
            pour toutes les PME françaises. <strong>4 millions d'entreprises ne sont pas encore conformes.</strong>
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              {
                q: "Qu'est-ce que Factur-X ?",
                a: 'Factur-X est un standard de facturation électronique hybride : un PDF lisible par l\'humain avec un fichier XML structuré intégré, lisible par les logiciels comptables et les plateformes d\'État (PPF/PDP).',
              },
              {
                q: 'Mes données sont-elles sécurisées ?',
                a: 'Le traitement est 100% éphémère : votre PDF est analysé en mémoire et jamais stocké. L\'IA utilisée est Mistral AI, entreprise française dont les serveurs sont en Europe — conformité RGPD native, aucun transfert hors EU.',
              },
              {
                q: 'Quel profil Factur-X est utilisé ?',
                a: 'Le profil BASIC, compatible avec la majorité des plateformes de dématérialisation partenaires (PDP) et le Portail Public de Facturation (PPF).',
              },
              {
                q: 'Que faire si ma facture est scannée ?',
                a: 'FacturX Copilot gère les PDFs scannés automatiquement grâce à Mistral OCR. Si votre PDF est une image, l\'IA le lit quand même et extrait toutes les données. Aucun outil tiers nécessaire.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white border border-slate-100 rounded-xl p-5">
                <p className="font-semibold text-slate-800 mb-1">{q}</p>
                <p className="text-sm text-slate-500">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-100 mt-16 py-8 text-center text-sm text-slate-400">
        FacturX Copilot — Conforme EN16931 / Factur-X 1.0 BASIC
      </footer>
    </main>
  );
}
