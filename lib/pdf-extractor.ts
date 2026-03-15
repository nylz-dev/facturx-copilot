/**
 * PDF extractor + AI invoice parser
 * Stack: Mistral Small (texte natif) + Mistral OCR (scans/images)
 * 100% EU — données traitées en France, RGPD natif
 */

import { Mistral } from '@mistralai/mistralai';
import type { InvoiceData } from './facturx-generator';

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY ?? '' });

// --- OCR via Mistral OCR (upload file approach — avoids 411 Content-Length issue) ---

export async function ocrPdfWithMistral(buffer: ArrayBuffer): Promise<string> {
  // 1. Upload the PDF file to Mistral Files API
  const blob = new Blob([Buffer.from(buffer)], { type: 'application/pdf' });
  const uploadedFile = await mistral.files.upload({
    file: { fileName: 'invoice.pdf', content: blob },
    purpose: 'ocr',
  });

  try {
    // 2. Get a signed URL for the uploaded file
    const signedUrlResponse = await mistral.files.getSignedUrl({ fileId: uploadedFile.id });

    // 3. Run OCR using the signed URL
    const response = await mistral.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'document_url',
        documentUrl: signedUrlResponse.url,
      },
      includeImageBase64: false,
    });

    const pages = response.pages ?? [];
    return pages.map((p: { markdown?: string }) => p.markdown ?? '').join('\n').trim();
  } finally {
    // 4. Clean up — delete the uploaded file
    try { await mistral.files.delete({ fileId: uploadedFile.id }); } catch { /* ignore */ }
  }
}

// --- Structured Parsing via Mistral Small ---

const EXTRACTION_PROMPT = `Tu es un expert-comptable français. Analyse ce texte extrait d'une facture et retourne un JSON structuré.

RÈGLES STRICTES :
- invoiceDate et dueDate au format YYYYMMDD
- currency = "EUR" si non précisé
- country = "FR" si non précisé
- vatRate = parmi [0, 5.5, 10, 20]
- statedTotalHT, statedTotalTVA, statedTotalTTC : montants EXACTEMENT tels qu'écrits sur la facture (nombres décimaux)
- Si une donnée est absente, utilise null ou ""
- Retourne UNIQUEMENT le JSON brut, sans markdown

STRUCTURE :
{
  "invoiceNumber": "string",
  "invoiceDate": "YYYYMMDD",
  "dueDate": "YYYYMMDD ou null",
  "currency": "EUR",
  "statedTotalHT": number ou null,
  "statedTotalTVA": number ou null,
  "statedTotalTTC": number ou null,
  "seller": {
    "name": "string",
    "siret": "string ou null",
    "tvaNumber": "string ou null",
    "addressLine1": "string ou null",
    "city": "string ou null",
    "postalCode": "string ou null",
    "country": "FR"
  },
  "buyer": {
    "name": "string",
    "siret": "string ou null",
    "tvaNumber": "string ou null",
    "addressLine1": "string ou null",
    "city": "string ou null",
    "postalCode": "string ou null",
    "country": "FR"
  },
  "lines": [
    {
      "description": "string",
      "quantity": number,
      "unitPrice": number,
      "vatRate": number
    }
  ],
  "notes": "string ou null",
  "iban": "string ou null",
  "bic": "string ou null"
}

TEXTE DE LA FACTURE :
`;

export async function parseInvoiceWithMistral(text: string): Promise<Partial<InvoiceData>> {
  const response = await mistral.chat.complete({
    model: 'mistral-small-latest',
    messages: [
      {
        role: 'user',
        content: EXTRACTION_PROMPT + text,
      },
    ],
    temperature: 0,
    responseFormat: { type: 'json_object' },
  });

  const content = response.choices?.[0]?.message?.content ?? '';
  const text_content = typeof content === 'string' ? content : JSON.stringify(content);

  const clean = text_content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  return JSON.parse(clean) as Partial<InvoiceData>;
}

// --- Main entry: always use Mistral OCR (handles native + scanned, serverless-safe) ---

export async function extractAndParseInvoice(
  buffer: ArrayBuffer
): Promise<{ parsed: Partial<InvoiceData>; method: 'text' | 'ocr' }> {
  // Mistral OCR handles both native text PDFs and scanned images
  const text = await ocrPdfWithMistral(buffer);

  if (!text || text.replace(/\s/g, '').length < 50) {
    throw new Error(
      "Impossible d'extraire le contenu du PDF. Vérifiez que le fichier n'est pas corrompu."
    );
  }

  // Parse with Mistral Small
  const parsed = await parseInvoiceWithMistral(text);
  return { parsed, method: 'ocr' };
}
