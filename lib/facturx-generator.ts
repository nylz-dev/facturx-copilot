/**
 * Factur-X XML Generator
 * Profil: BASIC (EN16931-compatible)
 * Norme: UN/CEFACT Cross Industry Invoice D16B
 * Réforme fiscale FR septembre 2026
 */

import { create } from 'xmlbuilder2';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type XMLBuilder = any;

export interface InvoiceParty {
  name: string;
  siret?: string;
  tvaNumber?: string;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
  country?: string; // ISO 3166-1 alpha-2, default "FR"
}

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number; // HT
  vatRate: number;   // 0, 5.5, 10, 20
  unit?: string;     // default "C62" (pièce)
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;         // YYYYMMDD
  dueDate?: string;            // YYYYMMDD
  currency?: string;           // default EUR
  seller: InvoiceParty;
  buyer: InvoiceParty;
  lines: InvoiceLine[];
  notes?: string;
  paymentMeans?: string;       // ex: "30" = virement, "31" = prélèvement
  iban?: string;
  bic?: string;
  // Stated totals extracted directly from the PDF (override computed if present)
  statedTotalHT?: number | null;
  statedTotalTVA?: number | null;
  statedTotalTTC?: number | null;
}

interface VatGroup {
  rate: number;
  baseAmount: number;
  vatAmount: number;
}

function formatDate(d: string): string {
  return d.replace(/-/g, '').substring(0, 8);
}

function roundTo2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Safe string — returns undefined if blank/null so we skip empty elements */
function str(v: string | null | undefined): string | undefined {
  const s = (v ?? '').trim();
  return s.length > 0 ? s : undefined;
}

export function computeTotals(lines: InvoiceLine[]) {
  const vatGroups: Record<number, VatGroup> = {};
  let totalHT = 0;
  let totalTVA = 0;

  for (const line of lines) {
    const price = Math.abs(line.unitPrice); // always positive
    const qty   = Math.abs(line.quantity);
    const lineHT  = roundTo2(qty * price);
    const lineTVA = roundTo2(lineHT * line.vatRate / 100);
    totalHT  += lineHT;
    totalTVA += lineTVA;

    if (!vatGroups[line.vatRate]) {
      vatGroups[line.vatRate] = { rate: line.vatRate, baseAmount: 0, vatAmount: 0 };
    }
    vatGroups[line.vatRate].baseAmount += lineHT;
    vatGroups[line.vatRate].vatAmount  += lineTVA;
  }

  // Recalculate vatAmount at GROUP level (not sum of individual rounded amounts)
  // This ensures BT-117: CalculatedAmount = round(BasisAmount × Rate / 100)
  const finalVatGroups = Object.values(vatGroups).map(vg => ({
    ...vg,
    baseAmount: roundTo2(vg.baseAmount),
    vatAmount:  roundTo2(roundTo2(vg.baseAmount) * vg.rate / 100),
  }));
  const finalTotalTVA = roundTo2(finalVatGroups.reduce((s, vg) => s + vg.vatAmount, 0));

  return {
    totalHT:   roundTo2(totalHT),
    totalTVA:  finalTotalTVA,
    totalTTC:  roundTo2(totalHT + finalTotalTVA),
    vatGroups: finalVatGroups,
  };
}

/** Build a TradeParty node in the correct XSD order:
 *  Name → SpecifiedLegalOrganization → PostalTradeAddress → SpecifiedTaxRegistration
 *
 *  Mandatory rules (EN16931 Schematron):
 *  - BR-CO-26 : Seller MUST have at least one of BT-29/BT-30/BT-31
 *  - BR-Z-02  : Zero-rated lines require seller BT-31/BT-32 (VA or legal ID)
 *  - BR-8/BR-10/BR-11 : BOTH parties MUST have PostalTradeAddress with CountryID
 */
function addTradeParty(parentNode: XMLBuilder, party: InvoiceParty, isSeller = false) {
  const siret = str(party.siret);
  const tva   = str(party.tvaNumber);

  // ram:Name MUST come first in EN16931 TradePartyType XSD sequence
  parentNode.ele('ram:Name').txt(party.name);

  // SpecifiedLegalOrganization (BT-30 = SIRET) — AFTER Name
  // Seller: always emit (fallback 'N/A') to satisfy BR-CO-26 + BR-Z-02
  // Buyer: only if SIRET is available
  if (isSeller) {
    parentNode.ele('ram:SpecifiedLegalOrganization')
      .ele('ram:ID').txt(siret ?? 'N/A').up();
  } else if (siret) {
    parentNode.ele('ram:SpecifiedLegalOrganization')
      .ele('ram:ID').txt(siret).up();
  }

  // PostalTradeAddress — MANDATORY for both seller and buyer (BR-8, BR-10)
  // Always emit with at least CountryID to satisfy BR-9/BR-11
  const addr = parentNode.ele('ram:PostalTradeAddress');
  const zip   = str(party.postalCode);
  const line1 = str(party.addressLine1);
  const city  = str(party.city);
  if (zip)   addr.ele('ram:PostcodeCode').txt(zip);
  if (line1) addr.ele('ram:LineOne').txt(line1);
  if (city)  addr.ele('ram:CityName').txt(city);
  addr.ele('ram:CountryID').txt(str(party.country) ?? 'FR');

  // SpecifiedTaxRegistration (TVA = BT-31) — after PostalTradeAddress
  if (tva) {
    parentNode.ele('ram:SpecifiedTaxRegistration')
      .ele('ram:ID', { schemeID: 'VA' }).txt(tva).up();
  }
}

export function generateFacturXXML(invoice: InvoiceData): string {
  const currency = invoice.currency ?? 'EUR';
  const computed = computeTotals(invoice.lines);

  // Use stated totals from PDF if available (avoids rounding discrepancies)
  const totalHT  = invoice.statedTotalHT  != null ? roundTo2(invoice.statedTotalHT)  : computed.totalHT;
  const totalTVA = invoice.statedTotalTVA != null ? roundTo2(invoice.statedTotalTVA) : computed.totalTVA;
  const totalTTC = invoice.statedTotalTTC != null ? roundTo2(invoice.statedTotalTTC) : computed.totalTTC;
  const vatGroups = computed.vatGroups;
  if (invoice.statedTotalTVA != null && vatGroups.length === 1) {
    vatGroups[0].vatAmount = roundTo2(invoice.statedTotalTVA);
  }

  const invoiceDate = formatDate(invoice.invoiceDate);
  const dueDate     = invoice.dueDate ? formatDate(invoice.dueDate) : invoiceDate;

  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('rsm:CrossIndustryInvoice', {
      'xmlns:rsm': 'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100',
      'xmlns:qdt': 'urn:un:unece:uncefact:data:standard:QualifiedDataType:100',
      'xmlns:ram': 'urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100',
      'xmlns:xs':  'http://www.w3.org/2001/XMLSchema',
      'xmlns:udt': 'urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100',
    });

  // ── ExchangedDocumentContext ──────────────────────────────────────────────
  doc.ele('rsm:ExchangedDocumentContext')
    .ele('ram:GuidelineSpecifiedDocumentContextParameter')
    .ele('ram:ID').txt('urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic').up();

  // ── ExchangedDocument ─────────────────────────────────────────────────────
  const exDoc = doc.ele('rsm:ExchangedDocument');
  exDoc.ele('ram:ID').txt(invoice.invoiceNumber);
  exDoc.ele('ram:TypeCode').txt('380');
  exDoc.ele('ram:IssueDateTime')
    .ele('udt:DateTimeString', { format: '102' }).txt(invoiceDate).up();
  const notes = str(invoice.notes);
  if (notes) {
    exDoc.ele('ram:IncludedNote').ele('ram:Content').txt(notes).up();
  }

  // ── SupplyChainTradeTransaction ───────────────────────────────────────────
  const tx = doc.ele('rsm:SupplyChainTradeTransaction');

  // Line items
  invoice.lines.forEach((line, idx) => {
    const price  = Math.abs(line.unitPrice);
    const qty    = Math.abs(line.quantity);
    const lineHT = roundTo2(qty * price);

    const item = tx.ele('ram:IncludedSupplyChainTradeLineItem');
    item.ele('ram:AssociatedDocumentLineDocument')
      .ele('ram:LineID').txt(String(idx + 1)).up();
    item.ele('ram:SpecifiedTradeProduct')
      .ele('ram:Name').txt(str(line.description) ?? `Ligne ${idx + 1}`).up();

    item.ele('ram:SpecifiedLineTradeAgreement')
      .ele('ram:NetPriceProductTradePrice')
      .ele('ram:ChargeAmount').txt(price.toFixed(2)).up();

    item.ele('ram:SpecifiedLineTradeDelivery')
      .ele('ram:BilledQuantity', { unitCode: line.unit ?? 'C62' })
      .txt(qty.toFixed(4)).up();

    const lineSett = item.ele('ram:SpecifiedLineTradeSettlement');
    lineSett.ele('ram:ApplicableTradeTax')
      .ele('ram:TypeCode').txt('VAT').up()
      .ele('ram:CategoryCode').txt(line.vatRate === 0 ? 'Z' : 'S').up()
      .ele('ram:RateApplicablePercent').txt(line.vatRate.toFixed(2)).up();
    lineSett.ele('ram:SpecifiedTradeSettlementLineMonetarySummation')
      .ele('ram:LineTotalAmount').txt(lineHT.toFixed(2)).up();
  });

  // Header Trade Agreement
  const agreement = tx.ele('ram:ApplicableHeaderTradeAgreement');
  addTradeParty(agreement.ele('ram:SellerTradeParty'), invoice.seller, true);
  addTradeParty(agreement.ele('ram:BuyerTradeParty'), invoice.buyer, false);

  // Delivery — must not be empty, add ActualDeliverySupplyChainEvent with invoice date
  tx.ele('ram:ApplicableHeaderTradeDelivery')
    .ele('ram:ActualDeliverySupplyChainEvent')
    .ele('ram:OccurrenceDateTime')
    .ele('udt:DateTimeString', { format: '102' }).txt(invoiceDate).up();

  // Settlement — element order is strict per EN16931 CII XSD:
  // InvoiceCurrencyCode → SpecifiedTradeSettlementPaymentMeans → ApplicableTradeTax → ...
  const settlement = tx.ele('ram:ApplicableHeaderTradeSettlement');

  // 1. Currency MUST come first
  settlement.ele('ram:InvoiceCurrencyCode').txt(currency);

  // 2. Payment means AFTER currency
  if (invoice.iban) {
    const paymentInfo = settlement.ele('ram:SpecifiedTradeSettlementPaymentMeans');
    paymentInfo.ele('ram:TypeCode').txt(invoice.paymentMeans ?? '30');
    paymentInfo.ele('ram:PayeePartyCreditorFinancialAccount')
      .ele('ram:IBANID').txt(invoice.iban).up();
    const bic = str(invoice.bic);
    if (bic) {
      paymentInfo.ele('ram:PayeeSpecifiedCreditorFinancialInstitution')
        .ele('ram:BICID').txt(bic).up();
    }
  }

  // 3. VAT breakdown
  for (const vg of vatGroups) {
    const tax = settlement.ele('ram:ApplicableTradeTax');
    tax.ele('ram:CalculatedAmount').txt(vg.vatAmount.toFixed(2));
    tax.ele('ram:TypeCode').txt('VAT');
    tax.ele('ram:BasisAmount').txt(vg.baseAmount.toFixed(2));
    tax.ele('ram:CategoryCode').txt(vg.rate === 0 ? 'Z' : 'S');
    tax.ele('ram:RateApplicablePercent').txt(vg.rate.toFixed(2));
  }

  // Payment terms
  settlement.ele('ram:SpecifiedTradePaymentTerms')
    .ele('ram:DueDateDateTime')
    .ele('udt:DateTimeString', { format: '102' }).txt(dueDate).up();

  // Monetary summary — ALL values must be internally consistent (Schematron BT-106/109/112)
  // Use COMPUTED values to ensure consistency; stated values only fix the UI display
  const summary = settlement.ele('ram:SpecifiedTradeSettlementHeaderMonetarySummation');
  summary.ele('ram:LineTotalAmount').txt(computed.totalHT.toFixed(2));
  summary.ele('ram:TaxBasisTotalAmount').txt(computed.totalHT.toFixed(2)); // must = LineTotalAmount
  for (const vg of vatGroups) {
    const computedVatAmount = roundTo2(vg.baseAmount * vg.rate / 100);
    summary.ele('ram:TaxTotalAmount', { currencyID: currency }).txt(computedVatAmount.toFixed(2));
  }
  const computedGrandTotal = roundTo2(computed.totalHT + computed.totalTVA);
  summary.ele('ram:GrandTotalAmount').txt(computedGrandTotal.toFixed(2));
  summary.ele('ram:DuePayableAmount').txt(computedGrandTotal.toFixed(2));

  return doc.end({ prettyPrint: true });
}
