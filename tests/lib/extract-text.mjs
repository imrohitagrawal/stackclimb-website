// Turns a file into plain text for the PII gate to scan.
//
// Why this exists: tests/no-pii.mjs used to call readFileSync(f, 'utf8')
// directly. That works for source and markdown but returns garbage for a
// PDF's compressed content stream or a DOCX's zip container — the contact
// line never becomes matchable text, so the gate can add the extensions to
// SCAN_EXT and still catch nothing (DEF-37). This module is the missing
// decode step, split out so no-pii.mjs stays a scanner, not a parser.
//
// Two things text extraction structurally cannot do, so this module does not
// pretend to:
//   1. Headers, footers, footnotes, endnotes — mammoth's extractRawText only
//      reads the document body. Fixed by reading those XML parts directly
//      from the zip, alongside the body.
//   2. Contact info rendered as an IMAGE (a scanned card, a screenshot) has
//      no text to extract at all — no library fixes that without OCR. So
//      instead of silently passing, any .docx/.pdf carrying an embedded
//      image is flagged for a human, via `hasImages`. Fail closed, not
//      silently clean.
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
  const hasImages = /\/Subtype\s*\/Image\b/.test(input.toString('latin1'));
  return { text, hasImages };
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
  return { text, hasImages };
}

// Accepts either a file path (string) or an in-memory Buffer, so the
// self-test can build fixtures without touching disk. Always returns
// { text, hasImages } — hasImages is false for every non-binary format,
// since only PDF/DOCX can hide contact details behind pixels.
export async function extractText(pathOrBuffer, extHint) {
  const isBuffer = Buffer.isBuffer(pathOrBuffer);
  const rawExt = extHint ?? (isBuffer ? undefined : extname(pathOrBuffer));
  // Case-insensitive: resume.PDF and resume.pdf must dispatch identically.
  const ext = rawExt ? rawExt.toLowerCase() : rawExt;
  const data = isBuffer ? pathOrBuffer : readFileSync(pathOrBuffer);

  if (ext === '.pdf') return extractPdf(data);
  if (ext === '.docx') return extractDocx(data);
  return { text: data.toString('utf8'), hasImages: false };
}
