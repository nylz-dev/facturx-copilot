import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdfBuffer, parseInvoiceWithAI } from '@/lib/pdf-extractor';
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

    // 1. Extract text from PDF
    const pdfArrayBuffer = await file.arrayBuffer();
    const extractedText = await extractTextFromPdfBuffer(pdfArrayBuffer);

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json(
        { error: 'Impossible d\'extraire le texte du PDF. Vérifiez que le PDF n\'est pas scanné en image.' },
        { status: 422 }
      );
    }

    // 2. Parse invoice data with AI
    const parsedData = await parseInvoiceWithAI(extractedText);

    // Validate minimum required fields
    if (!parsedData.invoiceNumber || !parsedData.invoiceDate || !parsedData.seller?.name) {
      return NextResponse.json(
        { error: 'Données insuffisantes dans la facture. Vérifiez le numéro de facture, la date et le vendeur.' },
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

    // 3. Generate Factur-X XML
    const xmlString = generateFacturXXML(invoiceData);
    const totals = computeTotals(invoiceData.lines);

    // 4. Embed XML into PDF
    const pdfBytes = new Uint8Array(pdfArrayBuffer);
    const facturXPdfBytes = await embedFacturXInPdf(pdfBytes, xmlString, invoiceData.invoiceNumber);

    // 5. Return the hybrid PDF
    return new NextResponse(Buffer.from(facturXPdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facturx_${invoiceData.invoiceNumber}.pdf"`,
        'X-Invoice-Number': invoiceData.invoiceNumber,
        'X-Total-TTC': String(totals.totalTTC),
        'X-Invoice-Date': invoiceData.invoiceDate,
      },
    });
  } catch (err: unknown) {
    console.error('Erreur conversion Factur-X:', err);
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
