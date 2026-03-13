import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FacturXPro — Conformité Factur-X 2026 en 1 clic',
  description:
    'Transformez vos factures PDF en fichiers Factur-X hybrides (PDF+XML) conformes à la réforme fiscale française de septembre 2026. SaaS B2B pour les 4M de PME françaises.',
  keywords: 'factur-x, facturation électronique, réforme 2026, PPF, PDP, PME France',
  openGraph: {
    title: 'FacturXPro — Votre facture PDF devient Factur-X en 30 secondes',
    description: 'À partir du 1er septembre 2026, toutes les PME françaises devront émettre des factures au format Factur-X. Soyez conforme maintenant, en 30 secondes.',
    url: 'https://facturexpro.fr',
    siteName: 'FacturXPro',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://facturexpro.fr/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FacturXPro — Conformité Factur-X 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FacturXPro — Factur-X en 30 secondes',
    description: 'Conformité facturation électronique 2026 en 1 clic. Pour les 4M de PME françaises.',
    images: ['https://facturexpro.fr/og-image.png'],
  },
  metadataBase: new URL('https://facturexpro.fr'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
