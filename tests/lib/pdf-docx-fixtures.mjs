// PDF/DOCX byte-level fixture builders for tests/no-pii.mjs --self-test.
//
// Split out of self-test-fixtures.mjs (DEF-37 round 3) so that file stays
// the test runner, not also the fixture factory — the runner alone was
// pushing self-test-fixtures.mjs over the 250-line module budget.
//
// The PDF and DOCX fixtures are COMPRESSED (PDF: FlateDecode stream; DOCX:
// zip DEFLATE) specifically so a naive `buffer.toString('utf8')` passthrough
// cannot see the planted digits by accident. An earlier version of this file
// used uncompressed fixtures, which meant reverting extract-text.mjs to raw
// bytes still passed self-test — the mutation did not bite. Verified: with
// compression, that same revert now fails at 2/4 caught (review round 2).
//
// Run: imported by tests/lib/self-test-fixtures.mjs; no standalone CLI.

// /FlateDecode is zlib-wrapped deflate (RFC 1950), not raw deflate — using
// deflateRawSync here silently produced a stream pdf-parse could not read at
// all (extraction returned empty text), which would have made every PDF
// assertion below vacuously true. deflateSync is the correct one.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// A minimal single-page PDF with its content stream FlateDecode-compressed,
// built by hand from the well-known text-object template. No PDF-writing
// dependency needed for a fixture this small. withImage adds a real
// /Subtype /Image XObject so the embedded-image detector has something
// genuine to find — pixel content is irrelevant, only the dictionary shape.
// withObjStm adds a compressed-object-stream marker with NO raw
// /Subtype /Image text anywhere, so cannotVerify is the only thing that can
// catch it (DEF-37 round 3).
export function buildMinimalPdf(text, { withImage = false, withObjStm = false } = {}) {
  const escaped = text.replace(/([()\\])/g, '\\$1');
  const rawStream = `BT /F1 12 Tf 10 100 Td (${escaped}) Tj ET`;
  const compressed = deflateSync(Buffer.from(rawStream, 'latin1'));

  const resources = withImage
    ? '/Resources << /Font << /F1 4 0 R >> /XObject << /Im0 6 0 R >> >>'
    : '/Resources << /Font << /F1 4 0 R >> >>';

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] ${resources} /Contents 5 0 R >>`,
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
  const streamFooter = '\nendstream\nendobj\n';
  let pdfBuf = Buffer.concat([
    Buffer.from(pdf, 'latin1'),
    Buffer.from(streamHeader, 'latin1'),
    compressed,
    Buffer.from(streamFooter, 'latin1'),
  ]);

  if (withImage) {
    offsets.push(pdfBuf.length);
    const imgBody = '6 0 obj\n<< /Type /XObject /Subtype /Image /Width 1 /Height 1 '
      + '/ColorSpace /DeviceGray /BitsPerComponent 8 /Length 1 >>\nstream\n\x00\nendstream\nendobj\n';
    pdfBuf = Buffer.concat([pdfBuf, Buffer.from(imgBody, 'latin1')]);
  }

  // Content is irrelevant; only the dictionary's /Type marker matters to the
  // conservative cannotVerify detector in extract-text.mjs.
  if (withObjStm) {
    offsets.push(pdfBuf.length);
    const objStmBody = '7 0 obj\n<< /Type /ObjStm /N 0 /First 0 /Length 0 >>\nstream\n\nendstream\nendobj\n';
    pdfBuf = Buffer.concat([pdfBuf, Buffer.from(objStmBody, 'latin1')]);
  }

  const xrefStart = pdfBuf.length;
  let tail = `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) tail += `${String(off).padStart(10, '0')} 00000 n \n`;
  tail += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.concat([pdfBuf, Buffer.from(tail, 'latin1')]);
}

// A minimal DOCX (a DEFLATE-compressed zip: word/document.xml, optionally
// word/header1.xml, word/footer1.xml, word/media/image1.png). JSZip is a
// devDependency scoped to building this throwaway fixture, nothing else.
export async function buildDocx({ body, header, footer, withImage = false } = {}) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    + '<Default Extension="xml" ContentType="application/xml"/>'
    + '<Override PartName="/word/document.xml" '
    + 'ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
    + '</Types>');
  zip.folder('_rels').file('.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    + '<Relationship Id="rId1" '
    + 'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
    + 'Target="word/document.xml"/></Relationships>');
  zip.folder('word').file('document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    + '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
    + `<w:body><w:p><w:r><w:t>${body}</w:t></w:r></w:p></w:body></w:document>`);
  if (header) {
    zip.folder('word').file('header1.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
      + '<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
      + `<w:p><w:r><w:t>${header}</w:t></w:r></w:p></w:hdr>`);
  }
  if (footer) {
    zip.folder('word').file('footer1.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
      + '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
      + `<w:p><w:r><w:t>${footer}</w:t></w:r></w:p></w:ftr>`);
  }
  if (withImage) {
    // Content is irrelevant — extract-text.mjs only checks for the presence
    // of anything under word/media/, matching how a real DOCX embeds a
    // scanned card or screenshot.
    zip.folder('word').folder('media').file('image1.png', Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

// Corrupts a valid buffer by truncating it to half its length. For the PDF
// fixture this breaks the FlateDecode content stream and the xref table
// pdf-parse relies on; for the DOCX fixture it breaks the zip's central
// directory. Either way the file becomes unparseable, which is the point:
// this is what a real corrupted-in-transit or password-encrypted upload
// looks like to the extraction library, not literal garbage bytes that
// might fail for an unrelated reason.
export function corrupt(buf) {
  return buf.subarray(0, Math.floor(buf.length / 2));
}

// Writes a buffer to a throwaway file under the OS temp dir so scan() —
// which takes file paths, the same as the real gate — can be exercised
// end-to-end. Nothing here is committed; the caller deletes every path it
// gets back. Fine to touch disk: unlike the PII fixtures above, these files
// carry no real contact details, only structural corruption or an empty
// object-stream marker.
export function writeTemp(name, buf) {
  const p = join(tmpdir(), `no-pii-self-test-${process.pid}-${name}`);
  writeFileSync(p, buf);
  return p;
}
