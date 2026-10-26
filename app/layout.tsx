import type { Metadata } from 'next';
import './globals.css';
import { SITE_URL, SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'FacturXPro — Convertir une facture PDF en Factur-X en 30 secondes',
    template: `%s`,
  },
  description:
    'Convertissez vos factures PDF en Factur-X (PDF/A-3 + XML EN 16931) en 30 secondes, sans logiciel. Pour PME, TPE et indépendants concernés par la facturation électronique obligatoire 2026-2027.',
  keywords: ['factur-x', 'facturation électronique', 'facture électronique obligatoire', 'convertir pdf en factur-x', 'EN 16931', 'plateforme agréée', 'PME', 'réforme 2026 2027'],
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  openGraph: {
    title: 'FacturXPro — Votre facture PDF devient Factur-X en 30 secondes',
    description:
      'Depuis le 1er septembre 2026, toutes les entreprises doivent pouvoir recevoir des factures électroniques. PME et TPE devront les émettre au 1er septembre 2027. Préparez-vous en 30 secondes.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FacturXPro — Factur-X en 30 secondes',
    description: 'Convertissez vos factures PDF en Factur-X conforme EN 16931. Gratuit pour 3 factures par mois.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
