import { NextRequest, NextResponse } from 'next/server';
import { extractAndParseInvoice } from '@/lib/pdf-extractor';
import { generateFacturXXML, computeTotals, InvoiceData } from '@/lib/facturx-generator';
import { consumeQuota, FREE_LIMIT } from '@/lib/quota';
import { getEntitlementByLicenceKey } from '@/lib/entitlements';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File | null;
    if (!file) return NextResponse.json({ error: 'PDF manquant' }, { status: 400 });

    const licenceKey = req.headers.get('x-licence-key')?.trim() || null;
    const entitlement = licenceKey ? await getEntitlementByLicenceKey(licenceKey) : null;

    if (entitlement) {
      if (entitlement.limit !== Infinity) {
        const { allowed, used } = await consumeQuota(`licence:${licenceKey}`, entitlement.limit);
        if (!allowed) {
          return NextResponse.json(
            { error: 'Quota mensuel atteint pour votre abonnement.', code: 'quota_exceeded', used, limit: entitlement.limit },
            { status: 402 }
          );
        }
      }
    } else {
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        '127.0.0.1';
      const { allowed, used } = await consumeQuota(`ip:${ip}`, FREE_LIMIT);
      if (!allowed) {
        return NextResponse.json(
          { error: 'Quota gratuit atteint.', code: 'quota_exceeded', used, limit: FREE_LIMIT },
          { status: 402 }
        );
      }
    }

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
