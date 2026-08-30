/* Promotes the WATERMARKED share card into public/og.png and stamps its hash
 * into the manifest — the step that makes tests/og-card-contract.spec.js's
 * pngSha256 assertion self-enforcing.
 *
 * WHY THIS EXISTS. Without it, the cheapest way to clear a red contract is the
 * wrong fix: change hero copy -> contract goes red -> re-run the generator,
 * which rewrites the manifest to match the new build and writes a GITIGNORED
 * draft png -> commit the manifest -> both gates green while public/og.png is
 * still the old, stale card. A reviewer walked exactly that path. The
 * generator therefore always writes pngSha256: null, and only this script
 * stamps a real hash, because only this script actually moves the image.
 *
 *   npm run build && npm run og-card         # render the draft
 *   # watermark it (see tests/og-watermark.spec.js for the exact command)
 *   # LOOK AT THE RESULT
 *   npm run og-card:promote -- og-card.watermarked.png
 */
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const MANIFEST = 'tests/og-card.manifest.json';
const TARGET = 'public/og.png';
const src = process.argv[2];

if (!src) {
  console.error('usage: npm run og-card:promote -- <watermarked.png>');
  process.exit(1);
}
if (!fs.existsSync(src)) {
  console.error(`no such file: ${src}`);
  process.exit(1);
}
if (!fs.existsSync(MANIFEST)) {
  console.error(`${MANIFEST} missing — run \`npm run og-card\` first.`);
  process.exit(1);
}

const bytes = fs.readFileSync(src);
const sha = createHash('sha256').update(bytes).digest('hex');

/* The unwatermarked draft and the watermarked card differ in size; refusing an
   obviously-unwatermarked file here is cheap insurance against promoting the
   wrong one, since both live in the working directory with similar names. */
const draft = 'og-card.draft.png';
if (fs.existsSync(draft) && Buffer.compare(fs.readFileSync(draft), bytes) === 0) {
  console.error(`${src} is byte-identical to ${draft} — that is the UNWATERMARKED draft.`);
  console.error('watermark it first; see tests/og-watermark.spec.js for the command.');
  process.exit(1);
}

fs.writeFileSync(TARGET, bytes);
const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
m.pngSha256 = sha;
fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2) + '\n');

console.log(`✓ promoted ${src} -> ${TARGET}`);
console.log(`✓ stamped pngSha256 into ${MANIFEST}`);
console.log(`\nNow update the pin in tests/og-watermark.spec.js:`);
console.log(`  const EXPECTED_SHA256 = '${sha}';`);
