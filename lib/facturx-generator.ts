/**
 * Factur-X XML Generator
 * Profil: BASIC (EN16931-compatible)
 * Norme: UN/CEFACT Cross Industry Invoice D16B
 * Réforme fiscale FR septembre 2026
 */

import { create } from 'xmlbuilder2';
import { v4 as uuidv4 } from 'uuid';

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
}

interface VatGroup {
  rate: number;
  baseAmount: number;
  vatAmount: number;
}

function formatDate(d: string): string {
  // Accepts YYYYMMDD or ISO date
  return d.replace(/-/g, '').substring(0, 8);
}

function roundTo2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeTotals(lines: InvoiceLine[]) {
  const vatGroups: Record<number, VatGroup> = {};
  let totalHT = 0;
  let totalTVA = 0;

  for (const line of lines) {
    const lineHT = roundTo2(line.quantity * line.unitPrice);
    const lineTVA = roundTo2(lineHT * line.vatRate / 100);
    totalHT += lineHT;
    totalTVA += lineTVA;

    if (!vatGroups[line.vatRate]) {
      vatGroups[line.vatRate] = { rate: line.vatRate, baseAmount: 0, vatAmount: 0 };
    }
    vatGroups[line.vatRate].baseAmount += lineHT;
    vatGroups[line.vatRate].vatAmount += lineTVA;
  }

  return {
    totalHT: roundTo2(totalHT),
    totalTVA: roundTo2(totalTVA),
    totalTTC: roundTo2(totalHT + totalTVA),
    vatGroups: Object.values(vatGroups),
  };
}

export function generateFacturXXML(invoice: InvoiceData): string {
  const currency = invoice.currency ?? 'EUR';
  const country = (p: InvoiceParty) => p.country ?? 'FR';
  const { totalHT, totalTVA, totalTTC, vatGroups } = computeTotals(invoice.lines);
  const invoiceDate = formatDate(invoice.invoiceDate);
  const dueDate = invoice.dueDate ? formatDate(invoice.dueDate) : invoiceDate;

  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('rsm:CrossIndustryInvoice', {
      'xmlns:rsm': 'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100',
      'xmlns:qdt': 'urn:un:unece:uncefact:data:standard:QualifiedDataType:100',
      'xmlns:ram': 'urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100',
      'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
      'xmlns:udt': 'urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100',
    });

  // --- ExchangedDocumentContext ---
  const ctx = doc.ele('rsm:ExchangedDocumentContext');
  ctx.ele('ram:GuidelineSpecifiedDocumentContextParameter')
    .ele('ram:ID').txt('urn:factur-x.eu:1p0:basic').up();

  // --- ExchangedDocument ---
  const exDoc = doc.ele('rsm:ExchangedDocument');
  exDoc.ele('ram:ID').txt(invoice.invoiceNumber);
  exDoc.ele('ram:TypeCode').txt('380'); // Commercial invoice
  exDoc.ele('ram:IssueDateTime')
    .ele('udt:DateTimeString', { format: '102' }).txt(invoiceDate).up();
  if (invoice.notes) {
    exDoc.ele('ram:IncludedNote').ele('ram:Content').txt(invoice.notes).up();
  }

  // --- SupplyChainTradeTransaction ---
  const tx = doc.ele('rsm:SupplyChainTradeTransaction');

  // Line items
  invoice.lines.forEach((line, idx) => {
    const lineHT = roundTo2(line.quantity * line.unitPrice);
    const item = tx.ele('ram:IncludedSupplyChainTradeLineItem');
    item.ele('ram:AssociatedDocumentLineDocument')
      .ele('ram:LineID').txt(String(idx + 1)).up();
    item.ele('ram:SpecifiedTradeProduct')
      .ele('ram:Name').txt(line.description).up();

    const lineAgreement = item.ele('ram:SpecifiedLineTradeAgreement');
    lineAgreement.ele('ram:NetPriceProductTradePrice')
      .ele('ram:ChargeAmount').txt(line.unitPrice.toFixed(2)).up();

    item.ele('ram:SpecifiedLineTradeDelivery')
      .ele('ram:BilledQuantity', { unitCode: line.unit ?? 'C62' })
      .txt(line.quantity.toFixed(4)).up();

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
  // Seller
  const seller = agreement.ele('ram:SellerTradeParty');
  seller.ele('ram:Name').txt(invoice.seller.name);
  if (invoice.seller.siret) {
    seller.ele('ram:SpecifiedLegalOrganization')
      .ele('ram:ID', { schemeID: '0002' }).txt(invoice.seller.siret).up();
  }
  if (invoice.seller.tvaNumber) {
    seller.ele('ram:SpecifiedTaxRegistration')
      .ele('ram:ID', { schemeID: 'VA' }).txt(invoice.seller.tvaNumber).up();
  }
  if (invoice.seller.addressLine1 || invoice.seller.city) {
    const addr = seller.ele('ram:PostalTradeAddress');
    if (invoice.seller.postalCode) addr.ele('ram:PostcodeCode').txt(invoice.seller.postalCode);
    if (invoice.seller.addressLine1) addr.ele('ram:LineOne').txt(invoice.seller.addressLine1);
    if (invoice.seller.city) addr.ele('ram:CityName').txt(invoice.seller.city);
    addr.ele('ram:CountryID').txt(country(invoice.seller));
  }
  // Buyer
  const buyer = agreement.ele('ram:BuyerTradeParty');
  buyer.ele('ram:Name').txt(invoice.buyer.name);
  if (invoice.buyer.siret) {
    buyer.ele('ram:SpecifiedLegalOrganization')
      .ele('ram:ID', { schemeID: '0002' }).txt(invoice.buyer.siret).up();
  }
  if (invoice.buyer.tvaNumber) {
    buyer.ele('ram:SpecifiedTaxRegistration')
      .ele('ram:ID', { schemeID: 'VA' }).txt(invoice.buyer.tvaNumber).up();
  }
  if (invoice.buyer.addressLine1 || invoice.buyer.city) {
    const addr = buyer.ele('ram:PostalTradeAddress');
    if (invoice.buyer.postalCode) addr.ele('ram:PostcodeCode').txt(invoice.buyer.postalCode);
    if (invoice.buyer.addressLine1) addr.ele('ram:LineOne').txt(invoice.buyer.addressLine1);
    if (invoice.buyer.city) addr.ele('ram:CityName').txt(invoice.buyer.city);
    addr.ele('ram:CountryID').txt(country(invoice.buyer));
  }

  // Delivery
  tx.ele('ram:ApplicableHeaderTradeDelivery');

  // Settlement
  const settlement = tx.ele('ram:ApplicableHeaderTradeSettlement');
  if (invoice.iban) {
    const paymentInfo = settlement.ele('ram:SpecifiedTradeSettlementPaymentMeans');
    paymentInfo.ele('ram:TypeCode').txt(invoice.paymentMeans ?? '30');
    if (invoice.iban) {
      paymentInfo.ele('ram:PayeePartyCreditorFinancialAccount')
        .ele('ram:IBANID').txt(invoice.iban).up();
    }
    if (invoice.bic) {
      paymentInfo.ele('ram:PayeeSpecifiedCreditorFinancialInstitution')
        .ele('ram:BICID').txt(invoice.bic).up();
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
