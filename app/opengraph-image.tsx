import { ImageResponse } from 'next/og';

export const alt = 'FacturXPro — Vos factures PDF converties en Factur-X';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 60%)', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: '#0f172a', display: 'flex' }}>
          FacturX<span style={{ color: '#2563eb' }}>Pro</span>
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, color: '#0f172a', marginTop: 40, lineHeight: 1.1 }}>Votre facture PDF devient Factur-X en 30 secondes</div>
        <div style={{ fontSize: 32, color: '#475569', marginTop: 32 }}>Facturation électronique obligatoire · PME françaises · EN 16931</div>
      </div>
    ),
    size,
  );
}
