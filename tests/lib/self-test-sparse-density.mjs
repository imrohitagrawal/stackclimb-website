// Round 5 self-test checks: per-page/per-part sparse-text density.
//
// Split out of self-test-fixtures.mjs (round 5) to stay under the 250-line
// module budget — that file was already at 212 lines before this coverage
// existed. Round 4's sparse-text check averaged meaningful characters over
// the WHOLE document (PDF: chars / page count; DOCX: body + header/footer
// summed), so one degraded page or part hid behind a healthy rest-of-document
// and stayed under the radar. This file proves the per-page/per-part fix
// (extract-text.mjs) bites where the average did not: a 2-page PDF with only
// page 2 degraded, and a DOCX with a healthy body but a degraded footer.
//
// WHICH CHANGE TURNS IT RED: reverting extract-text.mjs's per-page PDF floor
// or per-part DOCX floor back to a whole-document average fails every
// "still flagged" assertion below, because the healthy page/part alone pads
// the average above the floor — proven directly against pdf-parse/mammoth,
// not simulated.
//
// Run: imported by self-test-fixtures.mjs; no standalone CLI.

import { buildMultiPagePdf, buildDocx, writeTemp } from './pdf-docx-fixtures.mjs';

const PAGE1 = 'This is ordinary boilerplate text with plenty of characters to spare';

export async function runSparseDensityChecks(extractText, scan, record, dirty, clean, tempPaths) {
  const { cannotVerify: page2Cv, reason: page2Reason } = await extractText(
    buildMultiPagePdf([PAGE1, dirty], { degradePages: [1] }), '.pdf',
  );
  record('2-page PDF, only page 2 degraded, still flagged cannotVerify (sparse-text)',
    page2Cv === true && page2Reason === 'sparse-text');

  const { cannotVerify: bothRealCv } = await extractText(buildMultiPagePdf([clean, dirty]), '.pdf');
  record('2-page PDF, both pages real, NOT flagged sparse (no false positive)', bothRealCv === false);

  const healthyBody = `${dirty} ${dirty} ${dirty}`;
  const { cannotVerify: footerCv, reason: footerReason } = await extractText(
    await buildDocx({ body: healthyBody, emptyFooter: true }), '.docx',
  );
  record('DOCX, healthy body but degraded footer, still flagged cannotVerify (sparse-text)',
    footerCv === true && footerReason === 'sparse-text');

  const { cannotVerify: healthyFooterCv } = await extractText(
    await buildDocx({ body: healthyBody, footer: clean }), '.docx',
  );
  record('DOCX, healthy body and healthy footer, NOT flagged sparse (no false positive)',
    healthyFooterCv === false);

  // scan() end-to-end: proves the fix bites at the layer that actually
  // decides whether the file ships, not just in the extractText() return.
  const page2DegradedPdf = writeTemp('page2degraded.pdf', buildMultiPagePdf(
    [PAGE1, dirty], { degradePages: [1] },
  ));
  tempPaths.push(page2DegradedPdf);
  const hits = await scan([page2DegradedPdf]);
  record('2-page PDF, only page 2 degraded, fails the gate closed (sparse-extraction hit)',
    hits.some((h) => h.rule === 'sparse-extraction'));
}
