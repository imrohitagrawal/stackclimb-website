// Self-test fixtures for tests/no-pii.mjs --self-test.
//
// Split out of no-pii.mjs so that file stays a scanner, not a fixture
// factory. Builds three kinds of check, all in memory, nothing written to
// disk and nothing committed:
//   1. plain-text planted numbers (pre-existing coverage)
//   2. a phone-shaped number embedded in a hand-built PDF (DEF-37)
//   3. the same, embedded in a hand-built DOCX (DEF-37)
// plus one clean fixture of each kind to prove no false positives.
//
// WHICH CHANGE TURNS IT RED: stub tests/lib/extract-text.mjs's .pdf/.docx
// branches to return '' (or drop them entirely) and the PDF/DOCX assertions
// below fail while the plain-text ones still pass — proof the coverage is
// real, not redundant with the text case.

// A minimal single-page PDF, built by hand from the well-known text-object
// template. No PDF-writing dependency needed for a fixture this small.
function buildMinimalPdf(text) {
  const escaped = text.replace(/([()\\])/g, '\\$1');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] '
      + '/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  const stream = `BT /F1 12 Tf 10 100 Td (${escaped}) Tj ET`;
  objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, 'latin1');
}

// A minimal single-run DOCX (a zip with word/document.xml). JSZip is a
// devDependency scoped to building this throwaway fixture, nothing else.
async function buildMinimalDocx(text) {
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
    + `<w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:body></w:document>`);
  return zip.generateAsync({ type: 'nodebuffer' });
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

  const plantedText = [dirty, `tel: +91 ${d.slice(0, 5)} ${d.slice(5)}`];
  const foundText = plantedText.filter((t) => matches(RULES, t));

  const cleanText = [clean, 'commit df8cfc3', '52 golden cases', '© 2026'];
  const falsePosText = cleanText.filter((t) => matches(RULES, t));

  const dirtyPdfText = await extractText(buildMinimalPdf(dirty), '.pdf');
  const cleanPdfText = await extractText(buildMinimalPdf(clean), '.pdf');
  const dirtyDocxText = await extractText(await buildMinimalDocx(dirty), '.docx');
  const cleanDocxText = await extractText(await buildMinimalDocx(clean), '.docx');

  const foundPdf = matches(RULES, dirtyPdfText);
  const falsePosPdf = matches(RULES, cleanPdfText);
  const foundDocx = matches(RULES, dirtyDocxText);
  const falsePosDocx = matches(RULES, cleanDocxText);

  const found = foundText.length + (foundPdf ? 1 : 0) + (foundDocx ? 1 : 0);
  const planted = plantedText.length + 2; // + 1 PDF plant + 1 DOCX plant
  const falsePos = falsePosText.length + (falsePosPdf ? 1 : 0) + (falsePosDocx ? 1 : 0);

  console.log(`self-test: ${found}/${planted} planted numbers caught (text, PDF, DOCX)`);
  console.log(`self-test: PDF extraction caught embedded number: ${foundPdf}`);
  console.log(`self-test: DOCX extraction caught embedded number: ${foundDocx}`);
  console.log(`self-test: ${falsePos} false positives on known-good strings`);
  const ok = found === planted && falsePos === 0;
  console.log(ok ? 'SELF-TEST PASS — the gate bites and does not cry wolf' : 'SELF-TEST FAIL');
  process.exit(ok ? 0 : 1);
}
