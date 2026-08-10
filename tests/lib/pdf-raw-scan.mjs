// Raw-decoded-stream PII backstop for PDF files (DEF-37 round 6).
//
// Why: pdf-parse's getText() returns RENDERED, page-geometry text. Measured
// directly (round 6 investigation): a Tj operator positioned off the visible
// page via a large Td offset, in the SAME content stream as visible text
// pdf-parse does extract, is silently dropped — pdf-parse extracts "clean
// text" and nothing else, even though the off-canvas string is sitting right
// there in the decompressed stream. /Annot /FreeText /Contents strings are
// never part of any page content stream at all, so pdf-parse never visits
// them either. Both are real content the renderer just doesn't place on the
// page — the fix is a pass that does not depend on page geometry or PDF
// structure to find text.
//
// This decompresses every FlateDecode stream in the raw PDF bytes (this is
// what the existing /ObjStm detection in extract-text.mjs already partially
// touches — decoding instead of only flagging closes that gap, since an
// /ObjStm's dictionary also declares /Filter /FlateDecode and is picked up
// by the same generic pass) and scans the decoded bytes directly. It also
// picks up literal (uncompressed) PDF strings that sit next to a /Contents
// key, since annotation text is commonly stored that way and need not be
// inside any stream.
//
// This is a best-effort scan, not a PDF parser: it does not resolve object
// numbers, /Length references, or filter chains — it only needs decoded
// bytes to run a regex against, not a correct document model. A stream that
// fails to inflate (corrupted, not actually Flate, encrypted) is silently
// skipped there; the existing embedded-image / ObjStm / extraction-failed /
// sparse-text checks remain the backstop for content this pass cannot open.
//
// WHICH CHANGE TURNS IT RED: revert extract-text.mjs to stop calling
// extractPdfRawText and the off-canvas-text / FreeText-annotation self-test
// fixtures fail — the planted digits exist only in a stream pdf-parse's
// structured extraction never surfaces, proven in the commit that added
// this file.
//
// Run: imported by extract-text.mjs; no standalone CLI.

import { inflateSync } from 'node:zlib';

const STREAM_START_RE = /stream\r?\n/g;
// How far back from `stream` to look for a `/Filter ... /FlateDecode`
// mention in the object's dictionary. Generous enough for a dictionary with
// several other keys (/Length, /Type, /Subtype, /Length1...) ahead of it.
const DICT_LOOKBACK = 400;

// Finds every `stream ... endstream` block in the raw bytes whose nearby
// dictionary mentions /FlateDecode, and inflates each one. Byte offsets are
// computed on a latin1 decode of the buffer, which is a lossless 1-byte-per-
// character round trip — string index and buffer byte offset always agree.
function decodeFlateStreams(text, buf) {
  const out = [];
  let m;
  STREAM_START_RE.lastIndex = 0;
  while ((m = STREAM_START_RE.exec(text)) !== null) {
    const dict = text.slice(Math.max(0, m.index - DICT_LOOKBACK), m.index);
    if (!/\/Filter[^>]*\/FlateDecode/.test(dict)) continue;
    const bodyStart = m.index + m[0].length;
    const endIdx = text.indexOf('endstream', bodyStart);
    if (endIdx === -1) continue;
    // PDF writers commonly place a trailing EOL before `endstream`; trim it
    // so it isn't fed into inflate as extra bytes.
    let bodyEnd = endIdx;
    if (buf[bodyEnd - 1] === 0x0a) bodyEnd--;
    if (buf[bodyEnd - 1] === 0x0d) bodyEnd--;
    try {
      out.push(inflateSync(buf.subarray(bodyStart, bodyEnd)).toString('latin1'));
    } catch {
      // Not actually Flate at this offset, or corrupted — skip; the
      // existing fail-closed checks cover content this cannot open.
    }
  }
  return out.join('\n');
}

// Literal (uncompressed) PDF strings next to a /Contents key — how
// annotation text (/Annot /FreeText, /Annot /Text popup notes) is typically
// stored. Handles PDF's backslash escapes so an escaped `\)` inside the
// string does not end the match early, and unescapes the captured group
// afterward so the PII regex sees the literal characters.
function decodeLiteralContents(text) {
  const re = /\/Contents\s*\(((?:\\.|[^\\()])*)\)/g;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push(m[1].replace(/\\([()\\])/g, '$1'));
  }
  return out.join('\n');
}

export function extractPdfRawText(input) {
  const text = input.toString('latin1');
  return [decodeFlateStreams(text, input), decodeLiteralContents(text)].join('\n');
}
