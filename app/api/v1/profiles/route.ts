/**
 * GET /api/v1/profiles
 * List available Factur-X conformance profiles
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    profiles: [
      {
        id: 'MINIMUM',
        name: 'Minimum',
        description: 'Invoice number, date, seller name, total amount, VAT. Suitable for simple invoices.',
        supported: false,
        fields: 5,
      },
      {
        id: 'BASIC_WL',
        name: 'Basic WL (Without Lines)',
        description: 'All Minimum fields + buyer info, payment terms, VAT breakdown. No line items.',
        supported: false,
        fields: 15,
      },
      {
        id: 'BASIC',
        name: 'Basic',
        description: 'Full invoice with line items, quantities, unit prices, VAT per line. Most common profile for French SMEs.',
        supported: true,
        default: true,
        fields: 25,
      },
      {
        id: 'EN16931',
        name: 'EN16931 (Comfort)',
        description: 'European standard profile. All Basic fields + order references, delivery info, allowances/charges.',
        supported: false,
        comingSoon: true,
        fields: 40,
      },
      {
        id: 'EXTENDED',
        name: 'Extended',
        description: 'Full Factur-X profile with all optional fields. For complex invoices with multiple deliveries, accounting references, etc.',
        supported: false,
        fields: 60,
      },
    ],
    standard: {
      name: 'Factur-X 1.0',
      equivalent: 'ZUGFeRD 2.1 (Germany)',
      basedOn: 'UN/CEFACT Cross Industry Invoice (CII) D16B',
      europeanNorm: 'EN16931',
      pdfStandard: 'PDF/A-3b',
    },
    frenchMandate: {
      law: 'Ordonnance n°2021-1190 du 15 septembre 2021',
      deadline: '2026-09-01',
      description: 'All B2B invoices in France must be issued in electronic format (Factur-X or other structured format) starting September 1, 2026.',
      penaltyPerInvoice: 15,
      currency: 'EUR',
    },
  });
}
