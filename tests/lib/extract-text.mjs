// Turns a file into plain text for the PII gate to scan.
//
// Why this exists: tests/no-pii.mjs used to call readFileSync(f, 'utf8')
// directly. That works for source and markdown but returns garbage for a
// PDF's compressed content stream or a DOCX's zip container — the contact
// line never becomes matchable text, so the gate can add the extensions to
// SCAN_EXT and still catch nothing (DEF-37). This module is the missing
// decode step, split out so no-pii.mjs stays a scanner, not a parser.
//
// Three things text extraction structurally cannot do, so this module does
// not pretend to:
//   1. Headers, footers, footnotes, endnotes — mammoth's extractRawText only
//      reads the document body. Fixed by reading those XML parts directly
//      from the zip, alongside the body.
//   2. Contact info rendered as an IMAGE (a scanned card, a screenshot) has
//      no text to extract at all — no library fixes that without OCR. So
//      instead of silently passing, any .docx/.pdf carrying an embedded
//      image is flagged for a human, via `hasImages`. Fail closed, not
//      silently clean.
//   3. A PDF/DOCX that cannot be parsed at all (corrupted, truncated,
//      password-encrypted) — extractPdf/extractDocx throw and the caller
//      fails the gate closed rather than skip the file. A PDF whose object
//      graph is partly compressed (/ObjStm, /Type /XRef) can hide an image
//      dictionary from the raw-byte scan — flagged via `cannotVerify`
//      instead of trying to decompress untrusted PDF internals.
//   4. A PDF/DOCX that parses WITHOUT throwing but degrades silently — a
//      corrupted content stream, or a stripped document body, that pdf-parse
//      or mammoth reads to completion and hands back near-empty text instead
//      of raising an error. round 4: measured that a flipped byte inside an
//      otherwise-valid FlateDecode content stream makes pdf-parse return ""
//      per page with no exception at all, and a technically-valid DOCX with
//      an empty <w:body> makes mammoth return "" with no message either. Both
//      would previously read as hasImages:false, cannotVerify:false, empty
//      text — reported clean with zero hits, the exact fail-open pattern
//      case 3 was supposed to close, one layer deeper. Caught the same way:
//      implausibly little extracted text for the document's size (PDF: chars
//      per page; DOCX: total chars) sets `cannotVerify` with
//      `reason: 'sparse-text'`.
//
// WHICH CHANGE TURNS IT RED: revert either branch below to the old
// readFileSync passthrough and `node tests/no-pii.mjs --self-test` fails on
// the PDF/DOCX assertions — proven in the commit that added this file. The
// self-test fixtures are compressed (DOCX: DEFLATE; PDF: FlateDecode) so a
// passthrough that never decodes cannot see the planted digits by accident.
// Reverting the sparse-text thresholds below to 0 (i.e. removing the check)
// fails the round-4 self-test assertions specifically: a corrupted-stream
// PDF and an empty-body DOCX that parse cleanly but return near-nothing.
//
// Run:  imported by tests/no-pii.mjs; no standalone CLI.

import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

// Deliberately low floors, chosen to bite on total degradation (0 chars —
// what pdf-parse/mammoth actually return when they silently give up, per
// the round-4 measurement) while staying well clear of the self-test's own
// short, real fixture text (~25-35 chars). A real resume/CV page carries
// hundreds of characters; nothing this low should ever false-positive on
// genuine content, so there is no tension between "catch degradation" and
// "don't cry wolf" at this threshold. False positives above this floor are
// cheap (a human looks); false negatives below it are the thing the gate
// exists to prevent.
const MIN_CHARS_PER_PDF_PAGE = 15;
const MIN_DOCX_CHARS = 15;

async function extractPdf(input) {
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: input });
  let text;
  let pageCount;
  try {
    const result = await parser.getText();
    text = result.text;
    // `total` is pdf-parse's page count, present even when every page came
    // back empty — it comes from the (uncorrupted) page tree, not from the
    // (possibly corrupted) content streams. Falls back to 1 so a division
    // below never hits 0/0.
    pageCount = result.total || 1;
  } finally {
    await parser.destroy();
  }
  // Heuristic, not a full parse: any /Subtype /Image object is a raster
  // image somewhere in the document. Whitespace between the two tokens
  // varies across PDF writers, so both are allowed.
  const raw = input.toString('latin1');
  const hasImages = /\/Subtype\s*\/Image\b/.test(raw);
  // PDF 1.5+ can pack ordinary objects — including an image XObject
  // dictionary — into a compressed object stream (/ObjStm), or use a
  // compressed cross-reference stream (/Type /XRef) instead of a plain
  // xref table. Either means part of the document's object graph is
  // FlateDecode-compressed and invisible to the raw-byte regex above: an
  // embedded image could be hiding in there and hasImages would silently
  // read false. Decompressing untrusted PDF internals just to check is more
  // machinery than a security gate should trust; the conservative fix is to
  // not claim certainty. cannotVerify fails the file closed the same way an
  // embedded image does, rather than risk a false "clean".
  const hasCompressedObjects = /\/Type\s*\/ObjStm\b/.test(raw) || /\/Type\s*\/XRef\b/.test(raw);
  // A single flipped byte inside an otherwise well-formed FlateDecode
  // content stream does not make pdf-parse throw — it makes pdf-parse
  // return "" for that page and carry on, per-page, silently. Strip
  // pdf-parse's own "-- N of M --" page separators before counting, so the
  // library's boilerplate can't pad a genuinely empty page into looking like
  // content.
  const meaningfulChars = text.replace(/\n\n--\s*\d+\s*of\s*\d+\s*--\n\n/g, '').replace(/\s+/g, '');
  const sparseText = (meaningfulChars.length / pageCount) < MIN_CHARS_PER_PDF_PAGE;
  const cannotVerify = hasImages ? false : (hasCompressedObjects || sparseText);
  const reason = hasCompressedObjects ? 'compressed-objects' : (sparseText ? 'sparse-text' : undefined);
  return { text, hasImages, cannotVerify, reason };
}

function stripXmlTags(xml) {
  return xml.replace(/<[^>]+>/g, ' ');
}

async function extractDocx(input) {
  const mammoth = (await import('mammoth')).default;
  const { default: JSZip } = await import('jszip');

  const bodyResult = await mammoth.extractRawText({ buffer: input });
  const zip = await JSZip.loadAsync(input);

  const extraParts = [];
  let hasImages = false;
  for (const name of Object.keys(zip.files)) {
    if (/^word\/media\//i.test(name)) {
      hasImages = true;
      continue;
    }
    if (/^word\/(header|footer|footnotes|endnotes)\d*\.xml$/i.test(name)) {
      const xml = await zip.files[name].async('string');
      extraParts.push(stripXmlTags(xml));
    }
  }

  const text = [bodyResult.value, ...extraParts].join('\n');
  // Same class of gap as the PDF path: a technically-valid DOCX with a
  // stripped or empty <w:body> makes mammoth return "" with zero warning
  // messages — no throw, nothing to catch. Measured directly (round 4).
  // Guard against hasImages the same way the PDF branch does: an image-only
  // DOCX (a scanned card, nothing else) is already caught by hasImages and
  // does not also need the sparse-text label.
  const meaningfulChars = text.replace(/\s+/g, '');
  const sparseText = meaningfulChars.length < MIN_DOCX_CHARS;
  const cannotVerify = hasImages ? false : sparseText;
  const reason = !hasImages && sparseText ? 'sparse-text' : undefined;
  return { text, hasImages, cannotVerify, reason };
}

// Accepts either a file path (string) or an in-memory Buffer, so the
// self-test can build fixtures without touching disk. Always returns
// { text, hasImages, cannotVerify, reason } — hasImages/cannotVerify false
// and reason undefined for every non-binary format, since only PDF/DOCX can
// hide contact details behind pixels, compressed internals, or a silently
// degraded parse. `reason` (set only when cannotVerify is true) is one of
// 'compressed-objects' (PDF /ObjStm or /Type /XRef) or 'sparse-text' (PDF or
// DOCX extraction returned implausibly little text) — the caller uses it to
// pick the right failure message.
//
// Throws — deliberately, does not catch — when the PDF/DOCX cannot be
// parsed at all (corrupted, truncated, password-encrypted). The caller
// (tests/no-pii.mjs scan()) treats that throw as a scan FAILURE for
// .pdf/.docx, not a skip: an unreadable file is exactly the file that most
// needs a human's eyes, so it must fail the gate closed, the same as an
// embedded image or a compressed object stream.
export async function extractText(pathOrBuffer, extHint) {
  const isBuffer = Buffer.isBuffer(pathOrBuffer);
  const rawExt = extHint ?? (isBuffer ? undefined : extname(pathOrBuffer));
  // Case-insensitive: resume.PDF and resume.pdf must dispatch identically.
  const ext = rawExt ? rawExt.toLowerCase() : rawExt;
  const data = isBuffer ? pathOrBuffer : readFileSync(pathOrBuffer);

  if (ext === '.pdf') return extractPdf(data);
  if (ext === '.docx') return extractDocx(data);
  return { text: data.toString('utf8'), hasImages: false, cannotVerify: false };
}
