// Fixture builders for the 5 specific holes the round-5 review reproduced
// with real constructed files, reproduced here the same way (DEF-37 round 6):
//   1. PDF off-canvas Td-positioned text
//   2. PDF /Annot /FreeText /Contents
//   3. DOCX comments.xml
//   4. DOCX footnote with digits split across raw XML tags/runs
//   5. DOCX drawingML text box
//
// Split out of pdf-docx-fixtures.mjs (which is already near its own 250-line
// budget) so this stays one file per concern, per AGENTS.md modularization.
//
// Run: imported by self-test-round6.mjs; no standalone CLI.

import { deflateSync } from 'node:zlib';

// A single-page PDF whose ONE content stream contains two Tj operators: one
// at an ordinary on-page position, one pushed far outside the /MediaBox via
// a large Td offset. Measured directly against pdf-parse 2.4.5: getText()
// returns only the on-page text and silently drops the off-canvas Tj — no
// error, no warning, just gone. Both operators live in the SAME referenced,
// FlateDecode-compressed content stream, so this is not an "orphan object"
// case — it is exactly the off-canvas-positioning hole the round-5 review
// named.
export function buildOffCanvasPdf(visibleText, hiddenText) {
  const escape = (s) => s.replace(/([()\\])/g, '\\$1');
  const raw = `BT /F1 12 Tf 10 100 Td (${escape(visibleText)}) Tj ET `
    + `BT /F1 12 Tf 50000 50000 Td (${escape(hiddenText)}) Tj ET`;
  return buildSinglePagePdf(raw);
}

// A PDF page carrying an /Annot /Subtype /FreeText annotation whose
// /Contents is a literal (uncompressed) PDF string — never part of any page
// content stream, so pdf-parse's page-text extraction never visits it. This
// is how sticky-note / free-text annotation content is commonly stored.
export function buildFreeTextAnnotPdf(visibleText, annotText) {
  const escape = (s) => s.replace(/([()\\])/g, '\\$1');
  const raw = `BT /F1 12 Tf 10 100 Td (${escape(visibleText)}) Tj ET`;
  return buildSinglePagePdf(raw, { annotContents: escape(annotText) });
}

// Shared single-page PDF builder for both fixtures above — deliberately
// minimal, hand-built the same way pdf-docx-fixtures.mjs's buildMinimalPdf
// is, so no extra PDF-writing dependency is needed.
function buildSinglePagePdf(rawStream, { annotContents } = {}) {
  const compressed = deflateSync(Buffer.from(rawStream, 'latin1'));
  const pageDict = annotContents
    ? '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] '
      + '/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R /Annots [6 0 R] >>'
    : '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] '
      + '/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    pageDict,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  for (const body of objects) {
    offsets.push(pdf.length);
    pdf += `${offsets.length} 0 obj\n${body}\nendobj\n`;
  }
  offsets.push(pdf.length);
  const streamHeader = `5 0 obj\n<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n`;
  let buf = Buffer.concat([
    Buffer.from(pdf, 'latin1'),
    Buffer.from(streamHeader, 'latin1'),
    compressed,
    Buffer.from('\nendstream\nendobj\n', 'latin1'),
  ]);
  if (annotContents) {
    offsets.push(buf.length);
    const annot = `6 0 obj\n<< /Type /Annot /Subtype /FreeText /Contents (${annotContents}) `
      + '/Rect [0 0 1 1] >>\nendobj\n';
    buf = Buffer.concat([buf, Buffer.from(annot, 'latin1')]);
  }
  const xrefStart = buf.length;
  let tail = `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) tail += `${String(off).padStart(10, '0')} 00000 n \n`;
  tail += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.concat([buf, Buffer.from(tail, 'latin1')]);
}

// Minimal valid DOCX skeleton shared by the three fixtures below. `extra` is
// a map of zip entry name -> XML string for whatever part the fixture wants
// to add alongside a clean body (comments.xml, a footnote part, or a
// document.xml with an embedded drawingML text box already spliced in).
async function buildDocxSkeleton(bodyXml, extra = {}) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    + '<Default Extension="xml" ContentType="application/xml"/>'
    + '</Types>');
  zip.folder('_rels').file('.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    + '<Relationship Id="rId1" '
    + 'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
    + 'Target="word/document.xml"/></Relationships>');
  zip.folder('word').file('document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    + '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
    + `${bodyXml}</w:document>`);
  for (const [name, xml] of Object.entries(extra)) {
    zip.folder('word').file(name, xml);
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

const CLEAN_BODY = '<w:body><w:p><w:r><w:t>Bengaluru, India</w:t></w:r></w:p></w:body>';

// comments.xml — not body, not header/footer/footnote/endnote, so the old
// named-part allowlist never read it at all.
export function buildDocxWithComments(commentText) {
  const commentsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    + '<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
    + `<w:comment w:id="0"><w:p><w:r><w:t>${commentText}</w:t></w:r></w:p></w:comment></w:comments>`;
  return buildDocxSkeleton(CLEAN_BODY, { 'comments.xml': commentsXml });
}

// A footnote where the digit string is split across separate <w:r> runs,
// the way Word splits text on formatting/spell-check boundaries. Once
// stripXmlTags turns every tag into a space, the digit groups land with a
// multi-space gap between each one — contiguous-digit patterns miss this by
// construction; it is the shape the phone-in-split regex exists for. (Not
// spelled out digit-by-digit in this comment: that shape would itself match
// the rule under test — see self-test-round6.mjs for the literal fixture.)
export function buildDocxFootnoteSplitRun(groups) {
  const runs = groups.map((g) => `<w:r><w:t>${g}</w:t></w:r>`).join('');
  const footnoteXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    + '<w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
    + `<w:footnote w:id="1"><w:p>${runs}</w:p></w:footnote></w:footnotes>`;
  return buildDocxSkeleton(CLEAN_BODY, { 'footnotes.xml': footnoteXml });
}

// A drawingML text box (w:txbxContent) embedded directly inside the main
// document body — mammoth's extractRawText does not walk into text-box
// content, so the body-only path never sees it. It lives in document.xml
// itself, not a separate named part, which is exactly why the old
// header/footer/footnote/endnote allowlist could never have covered it no
// matter how many names were added.
export function buildDocxWithTextBox(boxText) {
  const bodyXml = '<w:body><w:p><w:r><w:t>Bengaluru, India</w:t></w:r>'
    + '<w:pict><v:shape><v:textbox><w:txbxContent>'
    + `<w:p><w:r><w:t>${boxText}</w:t></w:r></w:p>`
    + '</w:txbxContent></v:textbox></v:shape></w:pict></w:r></w:p></w:body>';
  return buildDocxSkeleton(bodyXml);
}
