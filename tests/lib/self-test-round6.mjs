// Round 6 self-test checks: the 5 specific fixtures the round-5 review
// reproduced with real constructed files, which the pre-round-6 gate caught
// 0/5 of. Split out of self-test-fixtures.mjs to stay under the module
// budget, same pattern as self-test-sparse-density.mjs (round 5).
//
// WHICH CHANGE TURNS IT RED: revert extract-text.mjs's calls to
// extractPdfRawText / scanArchiveXmlParts, or revert no-pii.mjs's phone-in
// regex to require contiguous digits, and the matching assertion below fails
// while the others stay green — proof each of the 3 structural changes is
// independently load-bearing, not just present.
//
// Run: imported by self-test-fixtures.mjs; no standalone CLI.

import { writeTemp } from './pdf-docx-fixtures.mjs';
import {
  buildOffCanvasPdf, buildFreeTextAnnotPdf, buildDocxWithComments,
  buildDocxFootnoteSplitRun, buildDocxWithTextBox,
} from './round6-fixtures.mjs';

function matches(rules, text) {
  return rules.some((r) => {
    r.re.lastIndex = 0;
    let m;
    while ((m = r.re.exec(text))) {
      if (!r.filter || r.filter(m[0])) return true;
      if (m[0] === '') r.re.lastIndex++; // guard against zero-width infinite loop
    }
    return false;
  });
}

// A visible/decoy string for the two PDF fixtures below that deliberately
// avoids the shared `clean` constant's "IST (UTC+5:30)" — that phrase is on
// the ALLOW list (it is the site's own stated timezone), and placing it
// within 40 chars of the planted digits made the ALLOW context window cover
// the real hit too, silently clearing it. Measured directly: with `clean`
// as the visible text, the FreeText-annotation scan() check reported 0 hits
// even though the digits were plainly present in the extracted text — not a
// gap in extraction, an accidental ALLOW collision from fixture construction.
const VISIBLE = 'ordinary visible page text, nothing sensitive here';

export async function runRound6Checks(RULES, extractText, scan, record, dirty, clean, tempPaths) {
  // 1. PDF off-canvas Td-positioned text — same content stream as visible
  // text, pushed outside the /MediaBox. pdf-parse's structured extraction
  // measurably drops it; the raw FlateDecode-stream scan does not.
  const { text: offCanvasText } = await extractText(buildOffCanvasPdf(VISIBLE, dirty), '.pdf');
  record('PDF off-canvas Td text caught', matches(RULES, offCanvasText));
  const { text: offCanvasCleanText } = await extractText(buildOffCanvasPdf(VISIBLE, clean), '.pdf');
  record('PDF off-canvas text, both parts clean, NOT flagged', !matches(RULES, offCanvasCleanText));

  // 2. PDF /Annot /FreeText /Contents — never part of any page content
  // stream, so pdf-parse never visits it; caught by the literal-/Contents-
  // string scan instead.
  const { text: annotText } = await extractText(buildFreeTextAnnotPdf(VISIBLE, dirty), '.pdf');
  record('PDF /Annot FreeText Contents caught', matches(RULES, annotText));
  const { text: annotCleanText } = await extractText(buildFreeTextAnnotPdf(VISIBLE, clean), '.pdf');
  record('PDF annotation, contents clean, NOT flagged', !matches(RULES, annotCleanText));

  // 3. DOCX comments.xml — not body, not header/footer/footnote/endnote, so
  // the old named-part allowlist never read it. Caught by the archive-wide
  // *.xml scan instead.
  const { text: commentsText } = await extractText(await buildDocxWithComments(dirty), '.docx');
  record('DOCX comments.xml caught', matches(RULES, commentsText));
  const { text: commentsCleanText } = await extractText(await buildDocxWithComments(clean), '.docx');
  record('DOCX comments.xml, clean comment, NOT flagged', !matches(RULES, commentsCleanText));

  // 4. DOCX footnote, digits split across raw XML runs — tag-stripping turns
  // the run boundaries into whitespace gaps; the old contiguous-digit regex
  // missed it, the loosened phone-in pattern does not.
  const splitGroups = ['987', '65', '432', '10'];
  const { text: splitFootnoteText } = await extractText(
    await buildDocxFootnoteSplitRun(splitGroups), '.docx',
  );
  record('DOCX footnote, digits split across runs, caught', matches(RULES, splitFootnoteText));
  const { text: unsplitCleanText } = await extractText(
    await buildDocxFootnoteSplitRun(['clean', 'text', 'only']), '.docx',
  );
  record('DOCX footnote, ordinary split text, NOT flagged', !matches(RULES, unsplitCleanText));

  // 5. DOCX drawingML text box — lives inside document.xml itself, which
  // mammoth's extractRawText does not walk into. Caught by the archive-wide
  // scan of document.xml's raw XML, not by any named-part addition.
  const { text: textBoxText } = await extractText(await buildDocxWithTextBox(dirty), '.docx');
  record('DOCX drawingML text box caught', matches(RULES, textBoxText));
  const { text: textBoxCleanText } = await extractText(await buildDocxWithTextBox(clean), '.docx');
  record('DOCX drawingML text box, clean, NOT flagged', !matches(RULES, textBoxCleanText));

  // scan() end-to-end, via real temp files — the layer that actually decides
  // whether the file ships.
  const offCanvasPdf = writeTemp('offcanvas.pdf', buildOffCanvasPdf(VISIBLE, dirty));
  const annotPdf = writeTemp('annot.pdf', buildFreeTextAnnotPdf(VISIBLE, dirty));
  const commentsDocx = writeTemp('comments.docx', await buildDocxWithComments(dirty));
  const footnoteDocx = writeTemp('footnote-split.docx', await buildDocxFootnoteSplitRun(splitGroups));
  const textBoxDocx = writeTemp('textbox.docx', await buildDocxWithTextBox(dirty));
  tempPaths.push(offCanvasPdf, annotPdf, commentsDocx, footnoteDocx, textBoxDocx);

  const offCanvasHits = await scan([offCanvasPdf]);
  record('scan(): PDF off-canvas text fails the gate (phone-in hit)',
    offCanvasHits.some((h) => h.rule.startsWith('phone-in')));
  const annotHits = await scan([annotPdf]);
  record('scan(): PDF FreeText annotation fails the gate (phone-in hit)',
    annotHits.some((h) => h.rule.startsWith('phone-in')));
  const commentsHits = await scan([commentsDocx]);
  record('scan(): DOCX comments.xml fails the gate (phone-in hit)',
    commentsHits.some((h) => h.rule.startsWith('phone-in')));
  const footnoteHits = await scan([footnoteDocx]);
  record('scan(): DOCX split-run footnote fails the gate (phone-in hit)',
    footnoteHits.some((h) => h.rule.startsWith('phone-in')));
  const textBoxHits = await scan([textBoxDocx]);
  record('scan(): DOCX drawingML text box fails the gate (phone-in hit)',
    textBoxHits.some((h) => h.rule.startsWith('phone-in')));
}
