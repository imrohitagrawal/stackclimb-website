// Self-test fixtures for tests/no-pii.mjs --self-test.
//
// Split out of no-pii.mjs so that file stays a scanner, not a fixture
// factory. Builds these checks, all in memory, nothing written to disk and
// nothing committed:
//   1. plain-text planted numbers (pre-existing coverage)
//   2. a phone-shaped number embedded in a hand-built PDF (DEF-37)
//   3. the same, embedded in a hand-built DOCX (DEF-37)
//   4. a phone-shaped number in a DOCX header AND footer, clean body
//   5. a DOCX/PDF carrying an embedded image is flagged for manual review
//   6. uppercase .PDF/.DOCX extensions dispatch identically to lowercase
// plus one clean fixture of each kind to prove no false positives.
//
// WHICH CHANGE TURNS IT RED: stub tests/lib/extract-text.mjs's .pdf/.docx
// branches to return '' (or drop them entirely) and the PDF/DOCX assertions
// below fail while the plain-text ones still pass — proof the coverage is
// real, not redundant with the text case.
//
// The PDF and DOCX fixtures are COMPRESSED (PDF: FlateDecode stream; DOCX:
// zip DEFLATE) specifically so a naive `buffer.toString('utf8')` passthrough
// cannot see the planted digits by accident. An earlier version of this file
// used uncompressed fixtures, which meant reverting extract-text.mjs to raw
// bytes still passed self-test — the mutation did not bite. Verified: with
// compression, that same revert now fails at 2/4 caught (review round 2).

// /FlateDecode is zlib-wrapped deflate (RFC 1950), not raw deflate — using
// deflateRawSync here silently produced a stream pdf-parse could not read at
// all (extraction returned empty text), which would have made every PDF
// assertion below vacuously true. deflateSync is the correct one.
import { deflateSync } from 'node:zlib';

// A minimal single-page PDF with its content stream FlateDecode-compressed,
// built by hand from the well-known text-object template. No PDF-writing
// dependency needed for a fixture this small. withImage adds a real
// /Subtype /Image XObject so the embedded-image detector has something
// genuine to find — pixel content is irrelevant, only the dictionary shape.
function buildMinimalPdf(text, { withImage = false } = {}) {
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

  const xrefStart = pdfBuf.length;
  let tail = `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) tail += `${String(off).padStart(10, '0')} 00000 n \n`;
  tail += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.concat([pdfBuf, Buffer.from(tail, 'latin1')]);
}

// A minimal DOCX (a DEFLATE-compressed zip: word/document.xml, optionally
// word/header1.xml, word/footer1.xml, word/media/image1.png). JSZip is a
// devDependency scoped to building this throwaway fixture, nothing else.
async function buildDocx({ body, header, footer, withImage = false } = {}) {
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

function matches(rules, text) {
  return rules.some((r) => (r.re.lastIndex = 0, r.re.test(text)));
}

export async function runSelfTest(RULES, extractText) {
  // Assembled at runtime, never written literally. A real number here made
  // the gate fail on itself; a synthetic one did too. Building the digits
  // instead keeps the scanner honest — no file in the repo contains a
  // phone-shaped string.
  const d = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0].join('');
  const dirty = `Call me on ${d} any time`;
  const clean = 'Bengaluru, India · IST (UTC+5:30)';

  const checks = [];
  const record = (label, ok) => checks.push({ label, ok });

  // 1. Plain text — unchanged coverage.
  const plantedText = [dirty, `tel: +91 ${d.slice(0, 5)} ${d.slice(5)}`];
  const foundText = plantedText.filter((t) => matches(RULES, t));
  const cleanText = [clean, 'commit df8cfc3', '52 golden cases', '© 2026'];
  const falsePosText = cleanText.filter((t) => matches(RULES, t));

  // 2. PDF / DOCX body — DEF-37, now with compressed fixtures.
  const { text: dirtyPdfText } = await extractText(buildMinimalPdf(dirty), '.pdf');
  const { text: cleanPdfText } = await extractText(buildMinimalPdf(clean), '.pdf');
  const { text: dirtyDocxText } = await extractText(await buildDocx({ body: dirty }), '.docx');
  const { text: cleanDocxText } = await extractText(await buildDocx({ body: clean }), '.docx');

  const foundPdf = matches(RULES, dirtyPdfText);
  const falsePosPdf = matches(RULES, cleanPdfText);
  const foundDocx = matches(RULES, dirtyDocxText);
  const falsePosDocx = matches(RULES, cleanDocxText);

  const found = foundText.length + (foundPdf ? 1 : 0) + (foundDocx ? 1 : 0);
  const planted = plantedText.length + 2; // + 1 PDF plant + 1 DOCX plant
  const falsePos = falsePosText.length + (falsePosPdf ? 1 : 0) + (falsePosDocx ? 1 : 0);

  // 3. DOCX header/footer — clean body, number only in header1.xml/footer1.xml.
  const { text: headerText } = await extractText(
    await buildDocx({ body: clean, header: dirty }), '.docx',
  );
  const { text: footerText } = await extractText(
    await buildDocx({ body: clean, footer: dirty }), '.docx',
  );
  record('header PII caught', matches(RULES, headerText));
  record('footer PII caught', matches(RULES, footerText));

  // 4. Embedded image — fail closed, no OCR needed to flag it.
  const { hasImages: docxHasImages } = await extractText(
    await buildDocx({ body: clean, withImage: true }), '.docx',
  );
  const { hasImages: docxNoImage } = await extractText(await buildDocx({ body: clean }), '.docx');
  const { hasImages: pdfHasImages } = await extractText(
    buildMinimalPdf(clean, { withImage: true }), '.pdf',
  );
  const { hasImages: pdfNoImage } = await extractText(buildMinimalPdf(clean), '.pdf');
  record('DOCX with embedded image flagged', docxHasImages === true);
  record('DOCX without image not flagged', docxNoImage === false);
  record('PDF with embedded image flagged', pdfHasImages === true);
  record('PDF without image not flagged', pdfNoImage === false);

  // 5. Case-insensitive extension dispatch — .PDF/.DOCX must not fall
  // through to the raw-bytes passthrough, where they'd read as binary noise.
  const { text: upperPdfText } = await extractText(buildMinimalPdf(dirty), '.PDF');
  const { text: upperDocxText } = await extractText(await buildDocx({ body: dirty }), '.DOCX');
  record('uppercase .PDF dispatches to PDF extraction', matches(RULES, upperPdfText));
  record('uppercase .DOCX dispatches to DOCX extraction', matches(RULES, upperDocxText));

  console.log(`self-test: ${found}/${planted} planted numbers caught (text, PDF, DOCX)`);
  console.log(`self-test: PDF extraction caught embedded number: ${foundPdf}`);
  console.log(`self-test: DOCX extraction caught embedded number: ${foundDocx}`);
  console.log(`self-test: ${falsePos} false positives on known-good strings`);
  for (const { label, ok } of checks) {
    console.log(`self-test: ${label}: ${ok ? 'ok' : 'FAIL'}`);
  }

  const ok = found === planted && falsePos === 0 && checks.every((c) => c.ok);
  console.log(ok ? 'SELF-TEST PASS — the gate bites and does not cry wolf' : 'SELF-TEST FAIL');
  process.exit(ok ? 0 : 1);
}
