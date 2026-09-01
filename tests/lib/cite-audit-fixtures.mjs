// Fixtures derived from docs/contracts/cite-audit.md's matrix — one entry per contract cell,
// not per bug already known (Phase 3-4 of docs/practices/autonomous-run.md). FIXTURE_COUNT is
// asserted against this array's length in tests/cite-audit.mjs so a shrinking fixture set is
// itself caught, per the same instruction.
//
// Each row cites the matrix cell(s) it proves in its `cell` field so the mapping stays
// traceable. `want` is the number of citationsIn() hits the FORM must produce on its own —
// exemption is a separate layer, tested by EXEMPT_CASES below.

const C = ':'; // kept out of literal fixture strings so this file holds no real citation form.

export const FORM_FIXTURES = [
  ['d1 bare', 'foo.css' + C + '12', 1],
  ['d2 range', 'foo.css' + C + '12-14', 1],
  ['d3 continuation (two hits)', 'global.css' + C + '188, ' + C + '298', 2],
  ['d4 .githooks form', '.githooks/pre-commit' + C + '36', 1],
  ['d5 bare filename, no line', 'see foo.css for the rule', 0],
  ['d6a prose "line NN"', 'foo.css line 82', 0],
  ['d6b prose "#LNN"', 'see #L82 for it', 0],
  ['d7 contrast-ratio lookalike', 'contrast is 4.5' + C + '1 at that size', 0],
  ['d8 url with port', 'http://localhost' + C + '4321', 0],
  ['d9 url with embedded path+line', 'https://x.io' + C + '8080/a.js' + C + '3', 0],
  ['d10/d27 nonexistent target — verdict is form-only', 'ghost-file.css' + C + '99', 1],
  ['d18 live code, not a comment', 'const CITE = "foo.js' + C + '12";', 1],
  ['d19 string literal', 'const s = "foo.js' + C + '12";', 1],
  ['d20 JSDoc block', '/** see foo.js' + C + '12 */', 1],
  ['d25 target ext not in TARGETS', 'see image.png' + C + '12', 0],
  ['dcont21/25 host:port lookalike on an allowed ext (undeclared false-positive)', 'cache.js' + C + '3000', 1],
  ['dcont25 npm-package lookalike', 'pin at purify.js' + C + '3', 1],
  ['dcont2-31 orphaned continuation, no prior FILE_LINE', 'a tuple marker ,' + C + '12', 1],
  ['dcont2-32 two independent citations, no comma', 'foo.js' + C + '1 and bar.css' + C + '2', 2],
  ['dcont2-33 citation glued to a URL, no whitespace', 'https://x.test),foo.js' + C + '3', 0],
  ['dcont2-34 nested .githooks path', '.githooks/subdir/pre-commit' + C + '36', 0],
  ['dcont2-37a line:column truncates the span', 'foo.js' + C + '12:7', 1],
  ['dcont2-37b malformed suffix truncates the span', 'foo.js' + C + '12-', 1],
  ['dcont-26 NAME stops at a space', 'my file.js' + C + '3', 1],
];

/* dcont2-37a/b assert the truncated HIT, not just the count — checked separately in the
   runner because a bare count can't distinguish a correctly-truncated match from something
   else that also happens to count as 1. */
export const TRUNCATION_FIXTURES = [
  ['dcont2-37a', 'foo.js' + C + '12:7', 'foo.js' + C + '12'],
  ['dcont2-37b', 'foo.js' + C + '12-', 'foo.js' + C + '12'],
  ['dcont-26', 'my file.js' + C + '3', 'file.js' + C + '3'],
];

/* Exemption-layer cells — need audit(), not citationsIn(), because the verdict depends on the
   EXEMPT table, not the form alone. Each case is a fully virtual (file, lines, exempt table)
   triple so none of it depends on anything in the real tree. */
export const EXEMPT_CASES = [
  {
    id: 'd11/13 exact triple matches — EXEMPT',
    file: 'a.js', lines: ['x = purify.js' + C + '3;'],
    exempt: [{ file: 'a.js', line: 1, cites: ['purify.js' + C + '3'] }],
    wantBreaches: 0,
  },
  {
    id: 'd12/14 in-repo untracked, NOT in EXEMPT — FIRES',
    file: 'a.js', lines: ['x = purify.js' + C + '3;'],
    exempt: [],
    wantBreaches: 1,
  },
  {
    id: 'd15 basename collision, distinct citing lines — each FIRES independently',
    file: 'a.js', lines: ['x = purify.js' + C + '3;', 'y = purify.js' + C + '3;'],
    exempt: [{ file: 'a.js', line: 1, cites: ['purify.js' + C + '3'] }],
    wantBreaches: 1, // line 1 exempt, line 2 (same hit text, different citing line) still fires
  },
  {
    id: 'd16 C1 FIX — a different citation appended to an exempted line now FIRES (both)',
    file: 'a.js', lines: ['x = purify.js' + C + '3, src variant purify2.js' + C + '3;'],
    exempt: [{ file: 'a.js', line: 1, cites: ['purify.js' + C + '3'] }], // stale: set no longer matches
    wantBreaches: 2,
  },
  {
    id: 'identity truth table — field "line" wrong fails',
    file: 'a.js', lines: ['x', 'y = purify.js' + C + '3;'],
    exempt: [{ file: 'a.js', line: 1, cites: ['purify.js' + C + '3'] }], // recorded line 1, real is 2
    wantBreaches: 1,
  },
  {
    id: 'identity truth table — field "file" wrong fails',
    file: 'a.js', lines: ['x = purify.js' + C + '3;'],
    exempt: [{ file: 'b.js', line: 1, cites: ['purify.js' + C + '3'] }],
    wantBreaches: 1,
  },
  {
    id: 'identity truth table — cites value wrong fails',
    file: 'a.js', lines: ['x = purify.js' + C + '3;'],
    exempt: [{ file: 'a.js', line: 1, cites: ['different.js' + C + '9'] }],
    wantBreaches: 1,
  },
  {
    id: 'dcont-21 duplicate identical hits, set matches — BOTH exempted together',
    file: 'a.js', lines: ['purify.js' + C + '3 and purify.js' + C + '3 again'],
    exempt: [{ file: 'a.js', line: 1, cites: ['purify.js' + C + '3', 'purify.js' + C + '3'] }],
    wantBreaches: 0,
  },
  {
    id: 'dcont-21 duplicate identical hits, recorded set of one — BOTH fire together',
    file: 'a.js', lines: ['purify.js' + C + '3 and purify.js' + C + '3 again'],
    exempt: [{ file: 'a.js', line: 1, cites: ['purify.js' + C + '3'] }],
    wantBreaches: 2,
  },
];
