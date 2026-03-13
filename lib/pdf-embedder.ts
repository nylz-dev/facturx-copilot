/**
 * Embed Factur-X XML into PDF as attached file metadata
 * Crée un PDF/A-3b hybride conforme Factur-X
 */

import { PDFDocument, PDFName, PDFString, PDFHexString, PDFArray, PDFDict, PDFNumber, PDFStream } from 'pdf-lib';

export async function embedFacturXInPdf(
  pdfBytes: Uint8Array,
  xmlString: string,
  invoiceNumber: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const xmlBytes = Buffer.from(xmlString, 'utf-8');

  // Add the XML as embedded file
  const embeddedFileStream = pdfDoc.context.stream(xmlBytes, {
    Type: 'EmbeddedFile',
    Subtype: 'text/xml',
    Params: {
      Size: xmlBytes.length,
      ModDate: `D:${new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14)}Z`,
    },
  });

  const embeddedFileRef = pdfDoc.context.register(embeddedFileStream);

  // File specification dictionary
  const fileSpecDict = pdfDoc.context.obj({
    Type: 'Filespec',
    F: PDFString.of('factur-x.xml'),
    UF: PDFString.of('factur-x.xml'),
    Desc: PDFString.of('Factur-X XML'),
    AFRelationship: PDFName.of('Data'),
    EF: pdfDoc.context.obj({ F: embeddedFileRef, UF: embeddedFileRef }),
  });

  const fileSpecRef = pdfDoc.context.register(fileSpecDict);

  // Add to Names EmbeddedFiles
  const catalog = pdfDoc.catalog;

  // Names dict
  let namesDict = catalog.lookupMaybe(PDFName.of('Names'), PDFDict);
  if (!namesDict) {
    namesDict = pdfDoc.context.obj({});
    catalog.set(PDFName.of('Names'), namesDict);
  }

  // EmbeddedFiles name tree
  const embeddedFilesArray = pdfDoc.context.obj([
    PDFString.of('factur-x.xml'),
    fileSpecRef,
  ]);

  const embeddedFilesDict = pdfDoc.context.obj({
    Names: embeddedFilesArray,
  });

  namesDict.set(PDFName.of('EmbeddedFiles'), embeddedFilesDict);

  // AF (Associated Files) — required for Factur-X compliance
  const afArray = pdfDoc.context.obj([fileSpecRef]);
  catalog.set(PDFName.of('AF'), afArray);

  // Mark as PDF/A-3b via XMP metadata
  const xmpMetadata = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/"
      xmlns:fx="urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#">
      <pdfaid:part>3</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
      <fx:DocumentFileName>factur-x.xml</fx:DocumentFileName>
      <fx:DocumentType>INVOICE</fx:DocumentType>
      <fx:Version>1.0</fx:Version>
      <fx:ConformanceLevel>BASIC</fx:ConformanceLevel>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

  const xmpBytes = Buffer.from(xmpMetadata, 'utf-8');
  const metadataStream = pdfDoc.context.stream(xmpBytes, {
    Type: 'Metadata',
    Subtype: 'XML',
  });
  const metadataRef = pdfDoc.context.register(metadataStream);
  catalog.set(PDFName.of('Metadata'), metadataRef);

  return pdfDoc.save();
}
