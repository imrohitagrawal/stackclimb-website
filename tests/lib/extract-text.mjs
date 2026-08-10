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
//   3. A PDF that cannot be parsed at all (corrupted, truncated, password-
//      encrypted) — extractPdf/extractDocx throw and the caller fails the
//      gate closed rather than skip the file. A PDF whose object graph is
//      partly compressed (/ObjStm, /Type /XRef) can hide an image dictionary
//      from the raw-byte scan — flagged via `cannotVerify` instead of trying
//      to decompress untrusted PDF internals.
//
// WHICH CHANGE TURNS IT RED: revert either branch below to the old
// readFileSync passthrough and `node tests/no-pii.mjs --self-test` fails on
// the PDF/DOCX assertions — proven in the commit that added this file. The
// self-test fixtures are compressed (DOCX: DEFLATE; PDF: FlateDecode) so a
// passthrough that never decodes cannot see the planted digits by accident.
//
// Run:  imported by tests/no-pii.mjs; no standalone CLI.

import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

async function extractPdf(input) {
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: input });
  let text;
  try {
    const result = await parser.getText();
    text = result.text;
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
  const cannotVerify = !hasImages
    && (/\/Type\s*\/ObjStm\b/.test(raw) || /\/Type\s*\/XRef\b/.test(raw));
  return { text, hasImages, cannotVerify };
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
  return { text, hasImages, cannotVerify: false };
}

// Accepts either a file path (string) or an in-memory Buffer, so the
// self-test can build fixtures without touching disk. Always returns
// { text, hasImages, cannotVerify } — both flags false for every
// non-binary format, since only PDF/DOCX can hide contact details behind
// pixels or compressed internals.
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
