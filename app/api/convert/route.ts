import { NextRequest, NextResponse } from 'next/server';
import { extractAndParseInvoice } from '@/lib/pdf-extractor';
import { generateFacturXXML, computeTotals, InvoiceData } from '@/lib/facturx-generator';
import { embedFacturXInPdf } from '@/lib/pdf-embedder';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier PDF fourni' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Le fichier doit être un PDF' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 400 });
    }

    const pdfArrayBuffer = await file.arrayBuffer();

    // Auto-detect text vs scanned PDF, parse with Mistral
    const { parsed: parsedData, method } = await extractAndParseInvoice(pdfArrayBuffer);

    // Validate minimum required fields
    if (!parsedData.invoiceNumber || !parsedData.invoiceDate || !parsedData.seller?.name) {
      return NextResponse.json(
        { error: 'Données insuffisantes détectées dans la facture (numéro, date ou vendeur manquant).' },
        { status: 422 }
      );
    }

    if (!parsedData.lines || parsedData.lines.length === 0) {
      return NextResponse.json(
        { error: 'Aucune ligne de facturation détectée.' },
        { status: 422 }
      );
    }

    const invoiceData = parsedData as InvoiceData;

    // If Mistral extracted line items that don't sum to stated total,
    // adjust the last line's unit price to make totals match exactly.
    const computedTotals = computeTotals(invoiceData.lines);
    if (
      invoiceData.statedTotalHT != null &&
      invoiceData.lines.length > 0 &&
      Math.abs(computedTotals.totalHT - invoiceData.statedTotalHT) < 1
    ) {
      // Force line totals to match stated HT
      const delta = invoiceData.statedTotalHT - computedTotals.totalHT;
      const lastLine = invoiceData.lines[invoiceData.lines.length - 1];
      lastLine.unitPrice = Math.abs(lastLine.unitPrice) + delta / Math.abs(lastLine.quantity || 1);
    }

    // Generate Factur-X XML
    const xmlString = generateFacturXXML(invoiceData);
    const recomputedTotals = computeTotals(invoiceData.lines);
    const displayTTC = invoiceData.statedTotalTTC ?? recomputedTotals.totalTTC;

    // Embed XML into PDF
    const pdfBytes = new Uint8Array(pdfArrayBuffer);
    const facturXPdfBytes = await embedFacturXInPdf(pdfBytes, xmlString, invoiceData.invoiceNumber);

    return new NextResponse(Buffer.from(facturXPdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facturx_${invoiceData.invoiceNumber}.pdf"`,
        'X-Invoice-Number': invoiceData.invoiceNumber,
        'X-Total-TTC': String(displayTTC),
        'X-Invoice-Date': invoiceData.invoiceDate,
        'X-Extraction-Method': method,
      },
    });
  } catch (err: unknown) {
    console.error('Erreur conversion Factur-X:', err);
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
