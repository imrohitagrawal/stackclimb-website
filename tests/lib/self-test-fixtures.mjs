// Self-test fixtures for tests/no-pii.mjs --self-test.
//
// Split out of no-pii.mjs so that file stays a scanner, not a fixture
// factory. Byte-level PDF/DOCX builders now live in pdf-docx-fixtures.mjs
// (DEF-37 round 3 split, to stay under the 250-line module budget); this
// file is the check runner. Runs these checks, all in memory or in a
// throwaway temp file, nothing committed:
//   1. plain-text planted numbers (pre-existing coverage)
//   2. a phone-shaped number embedded in a hand-built PDF (DEF-37)
//   3. the same, embedded in a hand-built DOCX (DEF-37)
//   4. a phone-shaped number in a DOCX header AND footer, clean body
//   5. a DOCX/PDF carrying an embedded image is flagged for manual review
//   6. uppercase .PDF/.DOCX extensions dispatch identically to lowercase
//   7. a PDF using a compressed object stream (/ObjStm), with no raw
//      /Subtype /Image anywhere in the file, is flagged cannotVerify
//   8. a corrupted/truncated PDF or DOCX fails scan() closed
//      (extraction-failed hit, non-zero exit) instead of scanning as clean
//   9. round 4: a PDF/DOCX that parses WITHOUT throwing but returns
//      implausibly little text (a same-length byte-flip inside a valid
//      FlateDecode stream; a technically-valid, empty <w:body>) fails scan()
//      closed (sparse-extraction hit) instead of reporting zero PII hits
// plus one clean fixture of each kind to prove no false positives.
//
// WHICH CHANGE TURNS IT RED: stub tests/lib/extract-text.mjs's .pdf/.docx
// branches to return '' (or drop them entirely) and the PDF/DOCX assertions
// below fail while the plain-text ones still pass — proof the coverage is
// real, not redundant with the text case.

import { unlinkSync } from 'node:fs';
import {
  buildMinimalPdf, buildDocx, corrupt, writeTemp,
} from './pdf-docx-fixtures.mjs';
import { runSparseDensityChecks } from './self-test-sparse-density.mjs';

function matches(rules, text) {
  return rules.some((r) => (r.re.lastIndex = 0, r.re.test(text)));
}

export async function runSelfTest(RULES, extractText, scan) {
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

  // 6. Compressed object stream (/ObjStm) — no raw /Subtype /Image anywhere
  // in the file, so the old regex-only detector would have read this as
  // clean. cannotVerify must catch it, and scan() must turn that into a
  // gate-failing hit — proving the fix bites on both layers (extract-text.mjs
  // AND no-pii.mjs), not just the flag being computed and then ignored.
  const { hasImages: objStmHasImages, cannotVerify: objStmCannotVerify } = await extractText(
    buildMinimalPdf(clean, { withObjStm: true }), '.pdf',
  );
  record('ObjStm PDF has no raw image signature (proves the fixture is a fair test)', objStmHasImages === false);
  record('ObjStm PDF flagged cannotVerify', objStmCannotVerify === true);
  const { cannotVerify: plainCannotVerify } = await extractText(buildMinimalPdf(clean), '.pdf');
  record('plain PDF not flagged cannotVerify', plainCannotVerify === false);

  // 7. Silently-degraded extraction, round 4 — the parser reports SUCCESS
  // (no throw) but hands back near-empty text. This is the gap a
  // throws-only fail-closed check cannot see: hasImages false, no /ObjStm,
  // yet the document that "scanned clean" was never actually read.
  //   - degradeStream flips interior bytes of a valid FlateDecode content
  //     stream without changing its length; pdf-parse inflates it, gets
  //     nothing usable, and returns "" per page instead of throwing
  //     (measured against pdf-parse 2.4.5 — this does NOT throw, unlike
  //     truncating the stream, which does and is already covered by the
  //     corrupt()/extraction-failed path below).
  //   - emptyBody is a well-formed, valid <w:body></w:body>; mammoth returns
  //     "" with zero warning messages (measured).
  const { cannotVerify: degradedPdfCannotVerify, reason: degradedPdfReason } = await extractText(
    buildMinimalPdf(dirty, { degradeStream: true }), '.pdf',
  );
  record('degraded-stream PDF flagged cannotVerify (sparse-text)',
    degradedPdfCannotVerify === true && degradedPdfReason === 'sparse-text');
  const { cannotVerify: emptyDocxCannotVerify, reason: emptyDocxReason } = await extractText(
    await buildDocx({ emptyBody: true }), '.docx',
  );
  record('empty-body DOCX flagged cannotVerify (sparse-text)',
    emptyDocxCannotVerify === true && emptyDocxReason === 'sparse-text');
  const { cannotVerify: realPdfCannotVerify } = await extractText(buildMinimalPdf(dirty), '.pdf');
  record('real-content PDF NOT flagged sparse (no false positive)', realPdfCannotVerify === false);
  const { cannotVerify: realDocxCannotVerify } = await extractText(await buildDocx({ body: dirty }), '.docx');
  record('real-content DOCX NOT flagged sparse (no false positive)', realDocxCannotVerify === false);

  // 8. scan() end-to-end, via real temp files — the layer the two fixes
  // above actually live in. WHICH CHANGE TURNS EACH RED:
  //   - reverting no-pii.mjs's catch block to `continue` on extraction
  //     failure turns the corrupt-PDF/DOCX checks red (scan reports clean).
  //   - reverting the cannotVerify wiring in scan() turns the ObjStm check
  //     red (scan reports clean instead of a hit).
  const tempPaths = [];
  try {
    const validPdf = writeTemp('valid.pdf', buildMinimalPdf(clean));
    const validDocx = writeTemp('valid.docx', await buildDocx({ body: clean }));
    const corruptPdf = writeTemp('corrupt.pdf', corrupt(buildMinimalPdf(clean)));
    const corruptDocx = writeTemp('corrupt.docx', corrupt(await buildDocx({ body: clean })));
    const objStmPdf = writeTemp('objstm.pdf', buildMinimalPdf(clean, { withObjStm: true }));
    const degradedPdf = writeTemp('degraded.pdf', buildMinimalPdf(dirty, { degradeStream: true }));
    const emptyDocx = writeTemp('empty.docx', await buildDocx({ emptyBody: true }));
    tempPaths.push(validPdf, validDocx, corruptPdf, corruptDocx, objStmPdf, degradedPdf, emptyDocx);

    const validHits = await scan([validPdf, validDocx]);
    record('valid, readable PDF+DOCX with no PII still pass (0 hits)', validHits.length === 0);

    const corruptPdfHits = await scan([corruptPdf]);
    record(
      'corrupted PDF fails the gate closed (extraction-failed hit)',
      corruptPdfHits.some((h) => h.rule === 'extraction-failed'),
    );

    const corruptDocxHits = await scan([corruptDocx]);
    record(
      'corrupted DOCX fails the gate closed (extraction-failed hit)',
      corruptDocxHits.some((h) => h.rule === 'extraction-failed'),
    );

    const objStmHits = await scan([objStmPdf]);
    record(
      'ObjStm PDF fails the gate closed (compressed-object-stream hit)',
      objStmHits.some((h) => h.rule === 'compressed-object-stream'),
    );

    // Round 4: parses without error, degrades silently — must still fail
    // closed. WHICH CHANGE TURNS THIS RED: removing the sparse-text check
    // from extract-text.mjs (or reverting no-pii.mjs's reason branch) makes
    // this report 0 hits, because the PII text itself was lost to the same
    // degradation the check exists to catch — a plain regex scan of the
    // near-empty extracted text finds nothing to flag either.
    const degradedPdfHits = await scan([degradedPdf]);
    record(
      'silently-degraded PDF fails the gate closed (sparse-extraction hit)',
      degradedPdfHits.some((h) => h.rule === 'sparse-extraction'),
    );

    const emptyDocxHits = await scan([emptyDocx]);
    record(
      'empty-body DOCX fails the gate closed (sparse-extraction hit)',
      emptyDocxHits.some((h) => h.rule === 'sparse-extraction'),
    );

    // Round 5: per-page/per-part density, not a whole-document average —
    // see self-test-sparse-density.mjs for what this closes and why.
    await runSparseDensityChecks(extractText, scan, record, dirty, clean, tempPaths);
  } finally {
    for (const p of tempPaths) unlinkSync(p);
  }

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
