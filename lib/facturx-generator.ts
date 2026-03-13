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

  return {
    totalHT:   roundTo2(totalHT),
    totalTVA:  roundTo2(totalTVA),
    totalTTC:  roundTo2(totalHT + totalTVA),
    vatGroups: Object.values(vatGroups),
  };
}

/** Build a TradeParty node in the correct XSD order:
 *  Name → SpecifiedLegalOrganization → PostalTradeAddress → SpecifiedTaxRegistration
 */
function addTradeParty(parentNode: XMLBuilder, party: InvoiceParty) {
  parentNode.ele('ram:Name').txt(party.name);

  // SpecifiedLegalOrganization (SIRET) — no schemeID, not in EN16931 codelist
  const siret = str(party.siret);
  if (siret) {
    parentNode.ele('ram:SpecifiedLegalOrganization')
      .ele('ram:ID').txt(siret).up();
  }

  // PostalTradeAddress — MUST come before SpecifiedTaxRegistration per XSD
  const line1 = str(party.addressLine1);
  const city  = str(party.city);
  const zip   = str(party.postalCode);
  if (line1 || city || zip) {
    const addr = parentNode.ele('ram:PostalTradeAddress');
    if (zip)   addr.ele('ram:PostcodeCode').txt(zip);
    if (line1) addr.ele('ram:LineOne').txt(line1);
    if (city)  addr.ele('ram:CityName').txt(city);
    addr.ele('ram:CountryID').txt(str(party.country) ?? 'FR');
  }

  // SpecifiedTaxRegistration (TVA) — MUST come after PostalTradeAddress
  const tva = str(party.tvaNumber);
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
    .ele('ram:ID').txt('urn:factur-x.eu:1p0:basic').up();

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
  addTradeParty(agreement.ele('ram:SellerTradeParty'), invoice.seller);
  addTradeParty(agreement.ele('ram:BuyerTradeParty'), invoice.buyer);

  // Delivery — must not be empty, add ActualDeliverySupplyChainEvent with invoice date
  tx.ele('ram:ApplicableHeaderTradeDelivery')
    .ele('ram:ActualDeliverySupplyChainEvent')
    .ele('ram:OccurrenceDateTime')
    .ele('udt:DateTimeString', { format: '102' }).txt(invoiceDate).up();

  // Settlement
  const settlement = tx.ele('ram:ApplicableHeaderTradeSettlement');

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

  settlement.ele('ram:InvoiceCurrencyCode').txt(currency);

  // VAT breakdown
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

  // Monetary summary
  const summary = settlement.ele('ram:SpecifiedTradeSettlementHeaderMonetarySummation');
  summary.ele('ram:LineTotalAmount').txt(totalHT.toFixed(2));
  summary.ele('ram:TaxBasisTotalAmount').txt(totalHT.toFixed(2));
  for (const vg of vatGroups) {
    summary.ele('ram:TaxTotalAmount', { currencyID: currency }).txt(vg.vatAmount.toFixed(2));
  }
  summary.ele('ram:GrandTotalAmount').txt(totalTTC.toFixed(2));
  summary.ele('ram:DuePayableAmount').txt(totalTTC.toFixed(2));

  return doc.end({ prettyPrint: true });
}
