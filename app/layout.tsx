import type { Metadata } from 'next';
import './globals.css';
import { SITE_NAME, SITE_URL, PLANS } from '@/lib/site';

const DESCRIPTION =
  'Convertissez vos factures PDF en Factur-X (PDF/A-3 + XML) conformes EN16931, validés veraPDF. Réception obligatoire depuis septembre 2026, émission PME/TPE en septembre 2027.';

export const metadata: Metadata = {
  title: 'FacturXPro — Convertir une facture PDF en Factur-X',
  description: DESCRIPTION,
  keywords: [
    'factur-x',
    'convertir facture pdf en factur-x',
    'facturation électronique',
    'réforme facturation électronique 2027',
    'EN16931',
    'PDF/A-3',
    'facture électronique PME',
    'expert-comptable factur-x',
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'FacturXPro — Votre facture PDF devient Factur-X en 30 secondes',
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'FacturXPro — Convertir une facture PDF en Factur-X',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FacturXPro — Factur-X en 30 secondes',
    description: 'Conversion PDF → Factur-X conforme EN16931, validée veraPDF. Pour les PME et les experts-comptables.',
    images: [`${SITE_URL}/og-image.png`],
  },
  metadataBase: new URL(SITE_URL),
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.png`,
  description: DESCRIPTION,
  areaServed: { '@type': 'Country', name: 'France' },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact@facturexpro.fr',
    contactType: 'customer support',
    availableLanguage: ['French'],
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: SITE_URL,
  description: DESCRIPTION,
  inLanguage: 'fr',
  offers: [
    {
      '@type': 'Offer',
      name: 'Découverte',
      price: '0',
      priceCurrency: 'EUR',
      description: '3 conversions par mois',
    },
    {
      '@type': 'Offer',
      name: PLANS.pro.name,
      price: String(PLANS.pro.price),
      priceCurrency: 'EUR',
      description: PLANS.pro.quota,
    },
    {
      '@type': 'Offer',
      name: PLANS.cabinet.name,
      price: String(PLANS.cabinet.price),
      priceCurrency: 'EUR',
      description: `${PLANS.cabinet.quota} + accès API REST`,
    },
  ],
  featureList: [
    'Conversion PDF vers Factur-X profil BASIC (EN16931)',
    'Sortie PDF/A-3b validée veraPDF',
    'Lecture des PDF scannés par OCR',
    'Détection des données manquantes bloquant la conformité',
    'API REST',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
