import { NextRequest, NextResponse } from 'next/server';
import { extractAndParseInvoice } from '@/lib/pdf-extractor';
import { generateFacturXXML, computeTotals, InvoiceData } from '@/lib/facturx-generator';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File | null;
    if (!file) return NextResponse.json({ error: 'PDF manquant' }, { status: 400 });

    const pdfArrayBuffer = await file.arrayBuffer();
    const { parsed: parsedData, method } = await extractAndParseInvoice(pdfArrayBuffer);
    const invoiceData = parsedData as InvoiceData;
    const xmlString = generateFacturXXML(invoiceData);
    const totals = computeTotals(invoiceData.lines);

    return NextResponse.json({ parsed: parsedData, xml: xmlString, totals, method });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
