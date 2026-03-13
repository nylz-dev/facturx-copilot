/**
 * PDF text extractor + AI invoice parser
 * Uses pdfjs-dist for text extraction, Gemini for structured parsing
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { InvoiceData } from './facturx-generator';

const GEMINI_KEY = process.env.GEMINI_API_KEY ?? '';

export async function extractTextFromPdfBuffer(buffer: ArrayBuffer): Promise<string> {
  // Dynamic import to avoid SSR issues with pdfjs worker
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '';

  const loadingTask = pdfjsLib.getDocument({ data: buffer, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText.trim();
}

const EXTRACTION_PROMPT = `Tu es un expert-comptable français. Analyse ce texte extrait d'une facture PDF et retourne un JSON structuré.

RÈGLES STRICTES :
- invoiceDate et dueDate au format YYYYMMDD
- currency = "EUR" si non précisé
- country = "FR" si non précisé  
- vatRate = parmi [0, 5.5, 10, 20]
- Si une donnée est absente, utilise null ou une valeur vide ""
- Retourne UNIQUEMENT le JSON, sans markdown ni explication

STRUCTURE ATTENDUE :
{
  "invoiceNumber": "string",
  "invoiceDate": "YYYYMMDD",
  "dueDate": "YYYYMMDD ou null",
  "currency": "EUR",
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

export async function parseInvoiceWithAI(text: string): Promise<Partial<InvoiceData>> {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY manquante');

  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent(EXTRACTION_PROMPT + text);
  const responseText = result.response.text().trim();

  // Strip markdown code blocks if present
  const clean = responseText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  return JSON.parse(clean) as Partial<InvoiceData>;
}
