// Turns a file into plain text for the PII gate to scan.
//
// Why this exists: tests/no-pii.mjs used to call readFileSync(f, 'utf8')
// directly. That works for source and markdown but returns garbage for a
// PDF's compressed content stream or a DOCX's zip container — the contact
// line never becomes matchable text, so the gate can add the extensions to
// SCAN_EXT and still catch nothing (DEF-37). This module is the missing
// decode step, split out so no-pii.mjs stays a scanner, not a parser.
//
// WHICH CHANGE TURNS IT RED: revert either branch below to the old
// readFileSync passthrough and `node tests/no-pii.mjs --self-test` fails on
// the PDF/DOCX assertions — proven in the commit that added this file.
//
// Run:  imported by tests/no-pii.mjs; no standalone CLI.

import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

async function extractPdf(input) {
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: input });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function extractDocx(input) {
  const mammoth = (await import('mammoth')).default;
  const result = await mammoth.extractRawText({ buffer: input });
  return result.value;
}

// Accepts either a file path (string) or an in-memory Buffer, so the
// self-test can build fixtures without touching disk.
export async function extractText(pathOrBuffer, extHint) {
  const isBuffer = Buffer.isBuffer(pathOrBuffer);
  const ext = extHint ?? (isBuffer ? undefined : extname(pathOrBuffer));
  const data = isBuffer ? pathOrBuffer : readFileSync(pathOrBuffer);

  if (ext === '.pdf') return extractPdf(data);
  if (ext === '.docx') return extractDocx(data);
  return data.toString('utf8');
}
