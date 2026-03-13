import UploadZone from '@/components/UploadZone';
import Countdown from '@/components/Countdown';
import MobileMenu from '@/components/MobileMenu';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* ─── Top urgency banner ─── */}
      <div className="bg-orange-500 text-white text-sm font-semibold text-center py-2 px-4">
        ⚠️ Obligation légale : 1er septembre 2026 — <Countdown /> avant la mise en conformité obligatoire
      </div>

      {/* ─── Header ─── */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧾</span>
            <span className="font-bold text-slate-900 text-xl tracking-tight">FacturX<span className="text-blue-600">Pro</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600 font-medium">
            <a href="#how" className="hover:text-slate-900 transition-colors">Comment ça marche</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          </nav>
          <a
            href="#upload"
            className="hidden md:inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            Essayer gratuitement →
          </a>
          <MobileMenu />
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="bg-gradient-to-b from-slate-50 to-white pt-20 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100">
              🇫🇷 Réforme facturation électronique 2026
            </span>
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-100">
              🔒 RGPD natif — données traitées en France
            </span>
            <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-100">
              🤖 Propulsé par Mistral AI
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-5 leading-tight tracking-tight">
            Votre facture PDF devient<br />
            <span className="text-blue-600">Factur-X en 30 secondes</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
            À partir du <strong className="text-slate-700">1er septembre 2026</strong>, toutes les PME françaises devront émettre des factures au format hybride Factur-X.{' '}
            <strong className="text-slate-700">4 millions d'entreprises ne sont pas encore prêtes.</strong> Soyez conforme maintenant.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400 font-medium mb-12">
            <span>✅ PDFs natifs & scannés</span>
            <span>✅ Profil BASIC conforme PPF/PDP</span>
            <span>✅ Aucun stockage de vos données</span>
            <span>✅ Résultat immédiat</span>
          </div>
        </div>
      </section>

      {/* ─── Upload Zone ─── */}
      <section id="upload" className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <UploadZone />
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how" className="bg-slate-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Comment ça marche ?</h2>
            <p className="text-slate-500">Trois étapes, zéro configuration, résultat immédiat.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📤',
                step: '01',
                title: 'Déposez votre PDF',
                desc: "Glissez-déposez votre facture existante. N'importe quel format de facture française — natif ou scanné.",
              },
              {
                icon: '🤖',
                step: '02',
                title: "L'IA extrait les données",
                desc: 'Mistral AI (🇫🇷) analyse votre facture et extrait vendeur, acheteur, lignes, TVA, IBAN en quelques secondes.',
              },
              {
                icon: '✅',
                step: '03',
                title: 'Téléchargez le Factur-X',
                desc: 'PDF hybride avec XML Factur-X intégré, conforme PPF/PDP. Prêt à envoyer à vos clients ou votre expert-comptable.',
              },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-xs font-bold text-blue-400 tracking-widest">ÉTAPE {s.step}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Tarifs simples et transparents</h2>
            <p className="text-slate-500">Sans engagement. Annulez quand vous voulez.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">

            {/* Free */}
            <div className="rounded-2xl border border-slate-200 p-7">
              <p className="text-sm font-semibold text-slate-500 mb-1">Découverte</p>
              <p className="text-4xl font-extrabold text-slate-900 mb-1">Gratuit</p>
              <p className="text-xs text-slate-400 mb-6">Pour tester la solution</p>
              <ul className="text-sm text-slate-600 space-y-2.5 mb-8">
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> 3 conversions / mois</li>
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> Profil BASIC</li>
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> PDFs natifs & scannés</li>
                <li className="flex gap-2"><span className="text-slate-300">—</span> Sans export XML séparé</li>
              </ul>
              <a href="#upload" className="block text-center border border-slate-300 text-slate-700 font-semibold py-2.5 rounded-lg hover:border-slate-400 transition-colors text-sm">
                Commencer gratuitement
              </a>
            </div>

            {/* Pro — highlighted */}
            <div className="rounded-2xl border-2 border-blue-600 p-7 relative shadow-lg">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                LE PLUS POPULAIRE
              </span>
              <p className="text-sm font-semibold text-blue-600 mb-1">Pro</p>
              <p className="text-4xl font-extrabold text-slate-900 mb-1">19€<span className="text-lg font-medium text-slate-400">/mois</span></p>
              <p className="text-xs text-slate-400 mb-6">Pour les PME et indépendants</p>
              <ul className="text-sm text-slate-600 space-y-2.5 mb-8">
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> <strong>100 conversions / mois</strong></li>
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> Profils BASIC & EN16931</li>
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> Export XML séparé</li>
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> Correction manuelle des champs</li>
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> Support prioritaire</li>
              </ul>
              <a href="#upload" className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm shadow-sm">
                Démarrer l'essai →
              </a>
            </div>

            {/* Business */}
            <div className="rounded-2xl border border-slate-200 p-7">
              <p className="text-sm font-semibold text-slate-500 mb-1">Cabinet / API</p>
              <p className="text-4xl font-extrabold text-slate-900 mb-1">49€<span className="text-lg font-medium text-slate-400">/mois</span></p>
              <p className="text-xs text-slate-400 mb-6">Pour les experts-comptables & éditeurs</p>
              <ul className="text-sm text-slate-600 space-y-2.5 mb-8">
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> <strong>Conversions illimitées</strong></li>
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> Accès API REST</li>
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> Tous les profils Factur-X</li>
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> Multi-comptes clients</li>
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> Onboarding dédié</li>
              </ul>
              <a href="mailto:contact@facturexpro.fr" className="block text-center border border-slate-300 text-slate-700 font-semibold py-2.5 rounded-lg hover:border-slate-400 transition-colors text-sm">
                Nous contacter
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="bg-slate-50 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-10 text-center">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              {
                q: "Qu'est-ce que Factur-X ?",
                a: "Factur-X est un standard de facturation électronique hybride : un PDF lisible par l'humain avec un fichier XML structuré intégré, lisible par les logiciels comptables et les plateformes d'État (PPF/PDP).",
              },
              {
                q: 'Mes données sont-elles sécurisées ?',
                a: "Le traitement est 100% éphémère : votre PDF est analysé en mémoire et jamais stocké. L'IA utilisée est Mistral AI, entreprise française dont les serveurs sont en Europe — conformité RGPD native, aucun transfert hors UE.",
              },
              {
                q: 'Mon ERP est-il compatible ?',
                a: "Le profil BASIC généré est compatible avec tous les ERP du marché (Sage, Cegid, EBP, Pennylane, etc.) et les plateformes PDP/PPF de l'État.",
              },
              {
                q: 'Que faire si ma facture est scannée ?',
                a: "FacturX Pro gère les PDFs scannés automatiquement grâce à Mistral OCR. Si votre PDF est une image, l'IA le lit quand même et extrait toutes les données. Aucun outil tiers nécessaire.",
              },
              {
                q: 'Puis-je corriger les données extraites ?',
                a: "Oui, sur les plans Pro et Cabinet, vous pouvez vérifier et corriger chaque champ extrait avant de générer le fichier final.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                <p className="font-semibold text-slate-800 mb-1.5">{q}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-100 bg-white py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🧾</span>
                <span className="font-bold text-slate-900">FacturX<span className="text-blue-600">Pro</span></span>
              </div>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Solution de conformité Factur-X pour les PME françaises.<br />
                Conforme EN16931 / Factur-X 1.0 BASIC.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="font-semibold text-slate-700 mb-2">Produit</p>
                <ul className="space-y-1.5 text-slate-400">
                  <li><a href="#how" className="hover:text-slate-600">Comment ça marche</a></li>
                  <li><a href="#pricing" className="hover:text-slate-600">Tarifs</a></li>
                  <li><a href="#faq" className="hover:text-slate-600">FAQ</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-2">Légal</p>
                <ul className="space-y-1.5 text-slate-400">
                  <li><a href="/mentions-legales" className="hover:text-slate-600">Mentions légales</a></li>
                  <li><a href="/rgpd" className="hover:text-slate-600">Politique RGPD</a></li>
                  <li><a href="mailto:contact@facturexpro.fr" className="hover:text-slate-600">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-xs text-slate-400">© 2026 FacturXPro. Tous droits réservés.</p>
            <p className="text-xs text-slate-400">Hébergé en France 🇫🇷 — Données non stockées — RGPD natif</p>
          </div>
        </div>
      </footer>

    </main>
  );
}
