import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FacturX Copilot — Conformité Factur-X 2026 en 1 clic',
  description:
    'Transformez vos factures PDF en fichiers Factur-X hybrides (PDF+XML) conformes à la réforme fiscale française de septembre 2026. SaaS B2B pour les 4M de PME françaises.',
  keywords: 'factur-x, facturation électronique, réforme 2026, PPF, PDP, PME France',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
