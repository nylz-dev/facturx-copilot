import { NextRequest, NextResponse } from 'next/server';
import { extractAndParseInvoice } from '@/lib/pdf-extractor';
import { generateFacturXXML, computeTotals, InvoiceData } from '@/lib/facturx-generator';
import { embedFacturXInPdf } from '@/lib/pdf-embedder';
import { isQuotaExceeded, incrementUsage, getUsage, FREE_LIMIT } from '@/lib/quota';
import { verifyAndConsumeToken } from '@/lib/tokens';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File | null;
    const token = (formData.get('token') as string | null)?.trim() || null;

    // ── Quota / Token gate ──────────────────────────────────────────────────
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    if (token) {
      // 1€ single-use token path
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        return NextResponse.json({ error: 'Configuration serveur manquante.' }, { status: 500 });
      }
      const { valid, error } = await verifyAndConsumeToken(token, secretKey);
      if (!valid) {
        return NextResponse.json(
          { error: error ?? 'Token invalide ou déjà utilisé.', code: 'token_invalid' },
          { status: 402 }
        );
      }
    } else {
      // Free quota path
      if (isQuotaExceeded(ip)) {
        const used = getUsage(ip);
        return NextResponse.json(
          {
            error: 'Quota gratuit atteint.',
            code: 'quota_exceeded',
            used,
            limit: FREE_LIMIT,
          },
          { status: 402 }
        );
      }
    }
    // ──────────────────────────────────────────────────────────────────────

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

    // Increment quota only for free path (token path is already paid)
    if (!token) {
      incrementUsage(ip);
    }

    const remaining = token ? null : FREE_LIMIT - getUsage(ip);

    return new NextResponse(Buffer.from(facturXPdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facturx_${invoiceData.invoiceNumber}.pdf"`,
        'X-Invoice-Number': invoiceData.invoiceNumber,
        'X-Total-TTC': String(displayTTC),
        'X-Invoice-Date': invoiceData.invoiceDate,
        'X-Extraction-Method': method,
        ...(remaining !== null ? { 'X-Free-Remaining': String(remaining) } : {}),
      },
    });
  } catch (err: unknown) {
    console.error('Erreur conversion Factur-X:', err);
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
