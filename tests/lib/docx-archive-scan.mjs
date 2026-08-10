// Archive-wide raw-XML PII backstop for DOCX files (DEF-37 round 6).
//
// Why: the allowlist approach (body + a header/footer/footnote/endnote regex
// on part NAMES) only ever covers parts its author thought to enumerate.
// Round 6's review found real PII in comments.xml, a drawingML text box
// living inside document.xml itself, and a footnote with digits split across
// XML runs — none of these needed a new named part added to the list, they
// needed the enumeration itself replaced. A .docx is a zip archive: this
// scans EVERY file inside it whose name ends in .xml, strips tags, and
// concatenates the result as a backstop that runs independent of which named
// part matters — current or any future Word feature that adds one.
//
// WHICH CHANGE TURNS IT RED: revert extract-text.mjs to stop calling
// scanArchiveXmlParts (or narrow this back to a named-part allowlist) and the
// comments.xml / drawingML-textbox self-test fixtures fail — proven in the
// commit that added this file.
//
// Run: imported by extract-text.mjs; no standalone CLI.

// Reused by extract-text.mjs's named-part loop too, so there is one
// tag-stripping implementation, not two that could drift apart.
export function stripXmlTags(xml) {
  return xml.replace(/<[^>]+>/g, ' ');
}

// Scans every *.xml part of an already-loaded JSZip archive — word/,
// docProps/, customXml/, anywhere — and returns their stripped text,
// concatenated. Does not care what the part is named or which feature put it
// there; this is the point (no enumeration to keep up to date).
export async function scanArchiveXmlParts(zip) {
  const parts = [];
  for (const name of Object.keys(zip.files)) {
    const entry = zip.files[name];
    if (entry.dir) continue;
    if (!/\.xml$/i.test(name)) continue;
    const xml = await entry.async('string');
    parts.push(stripXmlTags(xml));
  }
  return parts.join('\n');
}
