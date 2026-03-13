/**
 * Embed Factur-X XML into PDF as attached file metadata
 * Crée un PDF/A-3b hybride conforme Factur-X 1.0 BASIC
 */

import { PDFDocument, PDFName, PDFString, PDFArray, PDFDict } from 'pdf-lib';

export async function embedFacturXInPdf(
  pdfBytes: Uint8Array,
  xmlString: string,
  invoiceNumber: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const xmlBytes = Buffer.from(xmlString, 'utf-8');

  const now = new Date();
  const pdfDate = `D:${now.getUTCFullYear()}${String(now.getUTCMonth()+1).padStart(2,'0')}${String(now.getUTCDate()).padStart(2,'0')}${String(now.getUTCHours()).padStart(2,'0')}${String(now.getUTCMinutes()).padStart(2,'0')}${String(now.getUTCSeconds()).padStart(2,'0')}Z`;
  const isoDate = now.toISOString();

  // ── 1. Embedded file stream ──────────────────────────────────────────────
  const embeddedFileStream = pdfDoc.context.stream(xmlBytes, {
    Type: PDFName.of('EmbeddedFile'),
    Subtype: PDFName.of('application#2Fxml'), // application/xml encoded as PDF name
    Params: pdfDoc.context.obj({
      Size: xmlBytes.length,
      ModDate: PDFString.of(pdfDate),
    }),
  });
  const embeddedFileRef = pdfDoc.context.register(embeddedFileStream);

  // ── 2. File specification dictionary ─────────────────────────────────────
  const fileSpecDict = pdfDoc.context.obj({
    Type: PDFName.of('Filespec'),
    F: PDFString.of('factur-x.xml'),
    UF: PDFString.of('factur-x.xml'),
    Desc: PDFString.of('Factur-X XML Invoice'),
    AFRelationship: PDFName.of('Alternative'), // MANDATORY per Factur-X spec
    EF: pdfDoc.context.obj({
      F: embeddedFileRef,
      UF: embeddedFileRef,
    }),
  });
  const fileSpecRef = pdfDoc.context.register(fileSpecDict);

  // ── 3. Add to Names > EmbeddedFiles ──────────────────────────────────────
  const catalog = pdfDoc.catalog;

  let namesDict = catalog.lookupMaybe(PDFName.of('Names'), PDFDict);
  if (!namesDict) {
    namesDict = pdfDoc.context.obj({});
    catalog.set(PDFName.of('Names'), namesDict);
  }

  const embeddedFilesArray = pdfDoc.context.obj([
    PDFString.of('factur-x.xml'),
    fileSpecRef,
  ]);
  const embeddedFilesDict = pdfDoc.context.obj({ Names: embeddedFilesArray });
  namesDict.set(PDFName.of('EmbeddedFiles'), embeddedFilesDict);

  // ── 4. AF array (Associated Files — PDF/A-3 required) ────────────────────
  const afArray = pdfDoc.context.obj([fileSpecRef]);
  catalog.set(PDFName.of('AF'), afArray);

  // ── 5. XMP Metadata (PDF/A-3b + Factur-X) ────────────────────────────────
  // The fx: namespace MUST be declared as a PDF/A extension schema (ISO 19005-3 clause 6.2.3)
  const xmpMetadata = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">

    <rdf:Description rdf:about=""
        xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/"
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:xmp="http://ns.adobe.com/xap/1.0/"
        xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
      <pdfaid:part>3</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
      <dc:format>application/pdf</dc:format>
      <xmp:CreateDate>${isoDate}</xmp:CreateDate>
      <xmp:ModifyDate>${isoDate}</xmp:ModifyDate>
      <xmp:CreatorTool>FacturXPro</xmp:CreatorTool>
      <pdf:Producer>FacturXPro</pdf:Producer>
    </rdf:Description>

    <!-- Factur-X namespace declared as PDF/A extension schema (required by ISO 19005-3 §6.2.3) -->
    <rdf:Description rdf:about=""
        xmlns:pdfaExtension="http://www.aiim.org/pdfa/ns/extension/"
        xmlns:pdfaSchema="http://www.aiim.org/pdfa/ns/schema#"
        xmlns:pdfaProperty="http://www.aiim.org/pdfa/ns/property#">
      <pdfaExtension:schemas>
        <rdf:Bag>
          <rdf:li rdf:parseType="Resource">
            <pdfaSchema:schema>Factur-X PDFA Extension Schema</pdfaSchema:schema>
            <pdfaSchema:namespaceURI>urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#</pdfaSchema:namespaceURI>
            <pdfaSchema:prefix>fx</pdfaSchema:prefix>
            <pdfaSchema:property>
              <rdf:Seq>
                <rdf:li rdf:parseType="Resource">
                  <pdfaProperty:name>DocumentFileName</pdfaProperty:name>
                  <pdfaProperty:valueType>Text</pdfaProperty:valueType>
                  <pdfaProperty:category>external</pdfaProperty:category>
                  <pdfaProperty:description>Name of the embedded XML invoice file</pdfaProperty:description>
                </rdf:li>
                <rdf:li rdf:parseType="Resource">
                  <pdfaProperty:name>DocumentType</pdfaProperty:name>
                  <pdfaProperty:valueType>Text</pdfaProperty:valueType>
                  <pdfaProperty:category>external</pdfaProperty:category>
                  <pdfaProperty:description>INVOICE</pdfaProperty:description>
                </rdf:li>
                <rdf:li rdf:parseType="Resource">
                  <pdfaProperty:name>Version</pdfaProperty:name>
                  <pdfaProperty:valueType>Text</pdfaProperty:valueType>
                  <pdfaProperty:category>external</pdfaProperty:category>
                  <pdfaProperty:description>Factur-X version</pdfaProperty:description>
                </rdf:li>
                <rdf:li rdf:parseType="Resource">
                  <pdfaProperty:name>ConformanceLevel</pdfaProperty:name>
                  <pdfaProperty:valueType>Text</pdfaProperty:valueType>
                  <pdfaProperty:category>external</pdfaProperty:category>
                  <pdfaProperty:description>Factur-X conformance level</pdfaProperty:description>
                </rdf:li>
              </rdf:Seq>
            </pdfaSchema:property>
          </rdf:li>
        </rdf:Bag>
      </pdfaExtension:schemas>
    </rdf:Description>

    <rdf:Description rdf:about=""
        xmlns:fx="urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#">
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
    Type: PDFName.of('Metadata'),
    Subtype: PDFName.of('XML'),
  });
  const metadataRef = pdfDoc.context.register(metadataStream);
  catalog.set(PDFName.of('Metadata'), metadataRef);

  return pdfDoc.save();
}
