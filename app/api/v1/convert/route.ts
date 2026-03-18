/**
 * RapidAPI-compatible Factur-X Conversion Endpoint
 * POST /api/v1/convert
 * 
 * Accepts: multipart/form-data with a PDF file
 * Returns: Factur-X PDF (with embedded XML) or JSON with extracted data + XML
 * 
 * Headers (set by RapidAPI proxy):
 *   X-RapidAPI-Proxy-Secret — validates request comes from RapidAPI
 *   X-RapidAPI-User — subscriber identifier
 * 
 * Query params:
 *   output=pdf (default) — returns the Factur-X PDF binary
 *   output=json — returns JSON { invoiceData, xml, totals }
 *   output=xml — returns raw Factur-X XML
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractAndParseInvoice } from '@/lib/pdf-extractor';
import { generateFacturXXML, computeTotals, InvoiceData } from '@/lib/facturx-generator';
import { embedFacturXInPdf } from '@/lib/pdf-embedder';

export const runtime = 'nodejs';
export const maxDuration = 60;

// ── Auth middleware ────────────────────────────────────────────────────────────
function verifyApiAccess(req: NextRequest): { authorized: boolean; error?: string } {
  // 1. RapidAPI proxy secret (if configured — highest priority)
  const rapidApiSecret = process.env.RAPIDAPI_PROXY_SECRET;
  if (rapidApiSecret) {
    const proxySecret = req.headers.get('x-rapidapi-proxy-secret');
    if (proxySecret === rapidApiSecret) {
      return { authorized: true };
    }
  }

  // 2. Direct API key auth (for users coming from facturexpro.fr directly)
  const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
  const validKeys = (process.env.API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
  
  if (apiKey && validKeys.includes(apiKey)) {
    return { authorized: true };
  }

  // 3. If no auth is configured at all (dev mode), allow through
  if (!rapidApiSecret && validKeys.length === 0) {
    return { authorized: true };
  }

  return { authorized: false, error: 'Unauthorized — invalid or missing API key.' };
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Auth check
  const auth = verifyApiAccess(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error, code: 'unauthorized' },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        {
          error: 'Missing PDF file. Send as multipart/form-data with field name "file".',
          code: 'missing_file',
        },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF (application/pdf).', code: 'invalid_type' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10 MB.', code: 'file_too_large' },
        { status: 400 }
      );
    }

    const pdfArrayBuffer = await file.arrayBuffer();

    // Extract invoice data using Mistral AI OCR
    const { parsed: parsedData, method } = await extractAndParseInvoice(pdfArrayBuffer);

    // Validate minimum required fields
    if (!parsedData.invoiceNumber || !parsedData.invoiceDate || !parsedData.seller?.name) {
      return NextResponse.json(
        {
          error: 'Insufficient data extracted from invoice (missing number, date, or seller).',
          code: 'extraction_failed',
          extracted: parsedData,
        },
        { status: 422 }
      );
    }

    if (!parsedData.lines || parsedData.lines.length === 0) {
      return NextResponse.json(
        { error: 'No invoice line items detected.', code: 'no_lines' },
        { status: 422 }
      );
    }

    const invoiceData = parsedData as InvoiceData;

    // Fix rounding if needed
    const computedTotals = computeTotals(invoiceData.lines);
    if (
      invoiceData.statedTotalHT != null &&
      invoiceData.lines.length > 0 &&
      Math.abs(computedTotals.totalHT - invoiceData.statedTotalHT) < 1
    ) {
      const delta = invoiceData.statedTotalHT - computedTotals.totalHT;
      const lastLine = invoiceData.lines[invoiceData.lines.length - 1];
      lastLine.unitPrice = Math.abs(lastLine.unitPrice) + delta / Math.abs(lastLine.quantity || 1);
    }

    // Generate Factur-X XML
    const xmlString = generateFacturXXML(invoiceData);
    const recomputedTotals = computeTotals(invoiceData.lines);

    // Determine output format
    const output = req.nextUrl.searchParams.get('output') || 'pdf';

    // ── JSON output ─────────────────────────────────────────────────────────
    if (output === 'json') {
      return NextResponse.json({
        success: true,
        invoice: {
          number: invoiceData.invoiceNumber,
          date: invoiceData.invoiceDate,
          dueDate: invoiceData.dueDate || null,
          currency: invoiceData.currency || 'EUR',
          seller: invoiceData.seller,
          buyer: invoiceData.buyer,
          lines: invoiceData.lines,
          notes: invoiceData.notes || null,
          iban: invoiceData.iban || null,
          bic: invoiceData.bic || null,
        },
        totals: {
          totalHT: recomputedTotals.totalHT,
          totalTVA: recomputedTotals.totalTVA,
          totalTTC: recomputedTotals.totalTTC,
          vatBreakdown: recomputedTotals.vatGroups,
        },
        xml: xmlString,
        metadata: {
          extractionMethod: method,
          profile: 'BASIC',
          standard: 'Factur-X 1.0 (EN16931)',
        },
      });
    }

    // ── XML output ──────────────────────────────────────────────────────────
    if (output === 'xml') {
      return new NextResponse(xmlString, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Content-Disposition': `attachment; filename="factur-x_${invoiceData.invoiceNumber}.xml"`,
        },
      });
    }

    // ── PDF output (default) ────────────────────────────────────────────────
    const pdfBytes = new Uint8Array(pdfArrayBuffer);
    const facturXPdfBytes = await embedFacturXInPdf(pdfBytes, xmlString, invoiceData.invoiceNumber);

    return new NextResponse(Buffer.from(facturXPdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facturx_${invoiceData.invoiceNumber}.pdf"`,
        'X-Invoice-Number': invoiceData.invoiceNumber,
        'X-Total-TTC': String(invoiceData.statedTotalTTC ?? recomputedTotals.totalTTC),
        'X-Invoice-Date': invoiceData.invoiceDate,
        'X-Extraction-Method': method,
        'X-Facturx-Profile': 'BASIC',
      },
    });
  } catch (err: unknown) {
    console.error('Factur-X API error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json(
      { error: message, code: 'internal_error' },
      { status: 500 }
    );
  }
}

// ── GET — API info & health check ───────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    name: 'FacturXPro API',
    version: '1.0.0',
    description: 'Convert any French PDF invoice to Factur-X compliant format (PDF/A-3 + embedded XML). Powered by Mistral AI OCR.',
    endpoints: {
      'POST /api/v1/convert': {
        description: 'Convert a PDF invoice to Factur-X format',
        input: 'multipart/form-data with field "file" (PDF, max 10MB)',
        queryParams: {
          output: 'pdf (default) | json | xml',
        },
        outputs: {
          pdf: 'Factur-X compliant PDF/A-3 with embedded XML',
          json: 'Structured invoice data + XML + totals',
          xml: 'Raw Factur-X XML (UN/CEFACT CII)',
        },
      },
      'GET /api/v1/profiles': {
        description: 'List available Factur-X conformance profiles',
      },
    },
    standard: 'Factur-X 1.0 / ZUGFeRD 2.1',
    profiles: ['MINIMUM', 'BASIC WL', 'BASIC', 'EN16931', 'EXTENDED'],
    currentProfile: 'BASIC',
    compliance: 'EN16931 (European e-invoicing standard)',
    dataProcessing: 'EU-only (Mistral AI, France). No data stored. GDPR-native.',
  });
}
