/* The DEF-54 geometry gate's comparison, kept pure so it can be self-tested
   without a browser — the `audit(files, read)` seam file-budget.mjs uses,
   and the same split post-deploy.mjs makes for the same reason.
   No DOM, no fs, no @playwright/test import: feed it two plain objects.

   SHAPE. A baseline is { leg: { key: value } }. A leg is
   "<project>/w<width>/<route>". A value is either an array of integers,
   compared with the slack below, or a STRING, compared exactly. Every key is
   one element, so one changed element is one changed line in the pull request
   — the whole point of a text baseline.

   Strings carry the things that must not drift at all: a row's child tag
   sequence ("a,button,a,a,a") and the sentinel "hidden" for a child that has
   no box. A reorder of two equal-width children leaves every number identical
   and is caught only by the tag sequence — the shape a cross-model review of
   contact.spec.js already found once, where ["",""] certified sameness
   instead of existence.

   TOLERANCE, and an honest name for it. Pixel values are rounded once at
   capture and compared with a slack of 1, so the true window is up to ~2px:
   two measurements 1.999px apart can round to integers 1 apart. Saying
   "+/-1px" would be unearned precision. It is still an order of magnitude
   under the signal — DEF-55 measured run-to-run noise at exactly 1px on
   untouched plates (plate-citevyn-390 went 1305 -> 1306) while a real change
   moved plate-top-390 by 40px.
   Counts get ZERO slack: a count cannot round. Tag sequences are strings, so
   they get none either. (geometry.spec.js's header carried a second copy of
   this paragraph until DEF-58; the plate-citevyn number was the one fact it had
   that this one did not, and it is carried forward here.) */

export const PX_TOLERANCE = 1;

/* Keys whose values are counts, not pixels. Zero tolerance. */
const isCountKey = (key) => key.endsWith('.count');

const show = (v) => (Array.isArray(v) ? `[${v.join(', ')}]` : JSON.stringify(v));

/* One element, one comparison. Returns a breach string or null.
   RED WHEN: a box moves or resizes past the slack, a child flips between
   painted and hidden, a row's children are reordered or retyped, or a value
   changes arity (4 numbers becoming 2 means the measurement itself changed
   and the baseline no longer describes it). */
function compareValue(leg, key, want, got) {
  const where = `${leg} ${key}`;
  const strings = typeof want === 'string' || typeof got === 'string';
  if (strings) {
    return want === got ? null : `${where}: ${show(want)} -> ${show(got)}`;
  }
  if (!Array.isArray(want) || !Array.isArray(got)) {
    return `${where}: value is neither a string nor an array — baseline ${show(want)}, measured ${show(got)}`;
  }
  /* Two empty arrays compare clean, because `[].every(...)` is vacuously true.
     Unreachable from measureGeometry, which never emits one — but a corrupted
     or hand-edited baseline can, and "0 breaches" against nothing is the
     ["",""] shape this file exists to refuse. */
  if (want.length === 0) return `${where}: the recorded value is empty — it measures nothing`;
  if (want.length !== got.length) {
    return `${where}: ${want.length} numbers -> ${got.length} numbers, ${show(want)} -> ${show(got)}`;
  }
  /* Validate BEFORE subtracting. `Math.abs(undefined - 5)` is NaN, and
     `NaN <= slack` is false — so this particular arithmetic happens to fail
     safe, but the message would read "off by NaN". A missing or non-numeric
     value is its own fault with its own sentence, never an operand. This is
     the token-boundary hole in a different costume: a comparison that quietly
     succeeds on input it should have rejected. */
  const bad = want
    .map((w, i) => [i, w, got[i]])
    .filter(([, w, g]) => !Number.isFinite(w) || !Number.isFinite(g));
  if (bad.length) {
    return `${where}: non-numeric at ${bad.map(([i]) => i).join(',')} — ${show(want)} -> ${show(got)}`;
  }
  const slack = isCountKey(key) ? 0 : PX_TOLERANCE;
  const drift = want.map((w, i) => Math.abs(w - got[i]));
  if (drift.every((d) => d <= slack)) return null;
  const worst = Math.max(...drift);
  return `${where}: ${show(want)} -> ${show(got)} (off by ${worst}, slack ${slack})`;
}

/* Compare one leg. Key sets must match EXACTLY, both directions.
   A one-way loop ("for each measured key, look up the baseline") passes
   vacuously on an empty page AND on an empty baseline — which is DEF-54 one
   level up: run 32707441086 passed a baseline that was simply wrong.
   RED WHEN: a plate is added and not baselined, or a plate vanishes. */
export function compareLeg(leg, want, got) {
  const breaches = [];
  /* A leg must be a plain object. `Object.keys("abcdef")` returns ["0".."5"],
     so a corrupted baseline holding a STRING where a leg belongs would compare
     clean against the same string — 0 breaches, nothing measured. */
  const plain = (v) => v === undefined || (typeof v === 'object' && v !== null && !Array.isArray(v));
  if (!plain(want)) breaches.push(`${leg}: the baseline entry is not an object — ${show(want)}`);
  if (!plain(got)) breaches.push(`${leg}: the measurement is not an object — ${show(got)}`);
  if (breaches.length) return breaches;

  const wantKeys = Object.keys(want ?? {});
  const gotKeys = Object.keys(got ?? {});

  if (wantKeys.length === 0) {
    breaches.push(`${leg}: the baseline records nothing for this leg — it cannot certify anything`);
  }
  if (gotKeys.length === 0) {
    breaches.push(`${leg}: nothing was measured on this leg — the page rendered no geometry`);
  }

  const wantSet = new Set(wantKeys);
  const gotSet = new Set(gotKeys);
  for (const k of gotKeys) {
    if (!wantSet.has(k)) breaches.push(`${leg} ${k}: measured but NOT in the baseline — new geometry, unrecorded`);
  }
  for (const k of wantKeys) {
    if (!gotSet.has(k)) breaches.push(`${leg} ${k}: in the baseline but NOT measured — this geometry vanished`);
  }
  for (const k of wantKeys) {
    if (!gotSet.has(k)) continue;
    const breach = compareValue(leg, k, want[k], got[k]);
    if (breach) breaches.push(breach);
  }
  return breaches;
}

/* Whole-file compare, used by the self-test. The spec compares one leg at a
   time so a failure names the project, width and route in its own test title. */
export function compare(baseline, measured) {
  const breaches = [];
  const legs = new Set([...Object.keys(baseline ?? {}), ...Object.keys(measured ?? {})]);
  if (legs.size === 0) return ['nothing to compare — both the baseline and the measurement are empty'];
  for (const leg of [...legs].sort()) {
    breaches.push(...compareLeg(leg, baseline?.[leg], measured?.[leg]));
  }
  return breaches;
}

/* Serialize so the file is READABLE and one element is one line.
   JSON.stringify(x, null, 2) explodes every box across six lines, which
   destroys the property this whole design exists for. Keys are sorted so a
   regeneration on another machine cannot reshuffle the file and produce a
   diff that is pure noise. */
export function serialize(baseline) {
  const legs = Object.keys(baseline).sort();
  const legBlocks = legs.map((leg) => {
    const keys = Object.keys(baseline[leg]).sort();
    const lines = keys.map((k) => `    ${JSON.stringify(k)}: ${JSON.stringify(baseline[leg][k])}`);
    return `  ${JSON.stringify(leg)}: {\n${lines.join(',\n')}\n  }`;
  });
  return `{\n${legBlocks.join(',\n')}\n}\n`;
}
