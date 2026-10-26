import UploadZone from '@/components/UploadZone';
import Countdown from '@/components/Countdown';
import MobileMenu from '@/components/MobileMenu';
import CheckoutButton from '@/components/CheckoutButton';
import Link from 'next/link';
import { SITE_URL, JsonLd, organizationJsonLd } from '@/lib/site';
import { getAllPosts } from '@/lib/blog';

const FAQ = [
  {
    q: "Qu'est-ce que Factur-X ?",
    a: "Factur-X est un format de facture électronique hybride franco-allemand : un PDF/A-3 lisible par l'humain dans lequel est intégré un fichier XML structuré (syntaxe CII, norme européenne EN 16931), lisible par les logiciels comptables. C'est l'un des trois formats acceptés par la réforme française, avec UBL et CII.",
  },
  {
    q: 'Quand la facturation électronique devient-elle obligatoire ?',
    a: "Depuis le 1er septembre 2026, toutes les entreprises assujetties à la TVA en France doivent pouvoir recevoir des factures électroniques, et les grandes entreprises et ETI doivent les émettre. Les PME, TPE et micro-entreprises devront émettre leurs factures au format électronique à partir du 1er septembre 2027.",
  },
  {
    q: 'Un fichier Factur-X suffit-il pour être en règle ?',
    a: "Le format est une condition nécessaire mais pas suffisante : dans le cadre de la réforme, les factures entre entreprises doivent transiter par une plateforme agréée (PA, anciennement PDP). FacturXPro produit un fichier Factur-X conforme EN 16931 que vous pouvez déposer sur la plateforme agréée de votre choix, envoyer à votre expert-comptable ou utiliser dès aujourd'hui avec vos clients.",
  },
  {
    q: 'Quel profil Factur-X est généré ?',
    a: "FacturXPro génère le profil BASIC (et EN 16931 sur les offres payantes), conformes à la norme EN 16931. Les profils MINIMUM et BASIC WL ne contiennent pas les lignes de facture et ne sont pas suffisants pour la réforme.",
  },
  {
    q: 'Mes données sont-elles sécurisées ?',
    a: "Le traitement est 100% éphémère : votre PDF est analysé en mémoire et jamais stocké. L'IA utilisée est Mistral AI, entreprise française dont les serveurs sont en Europe — conformité RGPD native, aucun transfert hors UE.",
  },
  {
    q: 'Mon logiciel comptable est-il compatible ?',
    a: "Factur-X est un standard ouvert : le fichier généré peut être importé par les logiciels comptables qui gèrent ce format (Sage, Cegid, EBP, Pennylane, etc.) et déposé sur les plateformes agréées qui l'acceptent.",
  },
  {
    q: 'Que faire si ma facture est scannée ?',
    a: "FacturXPro gère les PDFs scannés automatiquement grâce à Mistral OCR. Si votre PDF est une image, l'IA le lit quand même et extrait toutes les données. Aucun outil tiers nécessaire.",
  },
  {
    q: 'Puis-je corriger les données extraites ?',
    a: "Oui, sur les plans Pro et Cabinet, vous pouvez vérifier et corriger chaque champ extrait avant de générer le fichier final.",
  },
];


export const revalidate = 3600;

export default async function Home() {
  const guides = (await getAllPosts()).slice(0, 6);

  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            organizationJsonLd,
            {
              '@type': 'WebSite',
              '@id': `${SITE_URL}/#website`,
              url: SITE_URL,
              name: 'FacturXPro',
              inLanguage: 'fr-FR',
              publisher: { '@id': `${SITE_URL}/#organization` },
            },
            {
              '@type': 'SoftwareApplication',
              name: 'FacturXPro',
              url: SITE_URL,
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description: 'Convertisseur en ligne de factures PDF (natives ou scannées) en Factur-X PDF/A-3 avec XML EN 16931, propulsé par Mistral AI.',
              offers: [
                { '@type': 'Offer', name: 'Découverte', price: '0', priceCurrency: 'EUR' },
                { '@type': 'Offer', name: 'Pro', price: '19', priceCurrency: 'EUR' },
                { '@type': 'Offer', name: 'Cabinet / API', price: '49', priceCurrency: 'EUR' },
              ],
              publisher: { '@id': `${SITE_URL}/#organization` },
            },
            {
              '@type': 'FAQPage',
              mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
            },
          ],
        }}
      />

      {/* ─── Top urgency banner ─── */}
      <div className="bg-orange-500 text-white text-sm font-semibold text-center py-2 px-4">
        ⚠️ PME et TPE : émission de factures électroniques obligatoire le 1er septembre 2027 — plus que <Countdown />
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
            <Link href="/blog" className="hover:text-slate-900 transition-colors">Guides</Link>
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
              🇫🇷 Réforme facturation électronique 2026-2027
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
            Depuis le <strong className="text-slate-700">1er septembre 2026</strong>, toutes les entreprises doivent pouvoir recevoir des factures électroniques.
            Les PME et TPE devront les <strong className="text-slate-700">émettre au 1er septembre 2027</strong>.{' '}
            Convertissez vos factures PDF au format Factur-X (EN 16931) dès maintenant, sans changer de logiciel.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400 font-medium mb-12">
            <span>✅ PDFs natifs & scannés</span>
            <span>✅ Profil BASIC conforme EN 16931</span>
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
                desc: 'PDF hybride avec XML Factur-X intégré, conforme EN 16931. Prêt à déposer sur votre plateforme agréée ou à envoyer à votre expert-comptable.',
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
              <CheckoutButton plan="pro" className="block w-full text-center bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm shadow-sm cursor-pointer">
                Démarrer l'essai →
              </CheckoutButton>
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
              <CheckoutButton plan="cabinet" className="block w-full text-center border border-slate-300 text-slate-700 font-semibold py-2.5 rounded-lg hover:border-slate-400 disabled:opacity-60 transition-colors text-sm cursor-pointer">
                S'abonner →
              </CheckoutButton>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Guides ─── */}
      <section id="guides" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Guides facturation électronique</h2>
            <p className="text-slate-500">Calendrier, formats, mentions obligatoires : tout ce qu'il faut savoir avant septembre 2027.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {guides.map((g) => (
              <Link key={g.slug} href={`/blog/${g.slug}`} className="block rounded-2xl border border-slate-100 p-6 hover:border-blue-200 hover:shadow-sm transition">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">{g.category}</span>
                <h3 className="font-bold text-slate-900 mt-2 mb-2 leading-snug">{g.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-3">{g.description}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/blog" className="text-blue-600 font-semibold hover:text-blue-700">Tous les guides &rarr;</Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="bg-slate-50 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-10 text-center">Questions fréquentes</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
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
                Conforme EN 16931 / Factur-X 1.0 BASIC.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="font-semibold text-slate-700 mb-2">Produit</p>
                <ul className="space-y-1.5 text-slate-400">
                  <li><a href="#how" className="hover:text-slate-600">Comment ça marche</a></li>
                  <li><a href="#pricing" className="hover:text-slate-600">Tarifs</a></li>
                  <li><a href="#faq" className="hover:text-slate-600">FAQ</a></li>
                  <li><Link href="/blog" className="hover:text-slate-600">Guides facturation électronique</Link></li>
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
