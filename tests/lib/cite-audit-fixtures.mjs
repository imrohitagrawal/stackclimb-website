// Fixtures derived from docs/contracts/cite-audit.md's matrix — one entry per contract cell,
// not per bug already known (Phase 3-4 of docs/practices/autonomous-run.md). REQUIRED_FIXTURES
// is a literal count, not a computed one, so deleting a fixture makes the two numbers disagree
// instead of the check quietly re-deriving a smaller floor from itself — round-1 review found
// the earlier `>= 30` version left 6 fixtures free to vanish unnoticed.
//
// `want` is the number of citationsIn() hits the FORM must produce on its own — exemption is a
// separate layer, tested by EXEMPT_CASES below.

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
  ['d18 live code, unquoted, not a string or comment', 'const map = { ref: foo.js' + C + '12 };', 1],
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
  // One FINDS fixture per TARGETS extension (f-cont finding 8, round-1 codex review): narrowing
  // TARGETS to drop any of these used to leave every existing fixture passing regardless.
  ['ext mjs', 'see script.mjs' + C + '5', 1],
  ['ext cjs', 'see script.cjs' + C + '5', 1],
  ['ext ts', 'see types.ts' + C + '5', 1],
  ['ext astro', 'see Page.astro' + C + '5', 1],
  ['ext md', 'see notes.md' + C + '5', 1],
  ['ext py', 'see script.py' + C + '5', 1],
  ['ext json', 'see data.json' + C + '5', 1],
  ['ext yml', 'see config.yml' + C + '5', 1],
  ['ext html', 'see page.html' + C + '5', 1],
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
   triple so none of it depends on anything in the real tree. Exemption is keyed on the FULL
   LINE TEXT (see cite-audit-core.mjs's EXEMPT comment) — `text` in each virtual exempt entry is
   what a maintainer would have recorded EARLIER; `lines` is what is on the line NOW. */
export const EXEMPT_CASES = [
  {
    id: 'd11/13 exact text matches — EXEMPT',
    file: 'a.js', lines: ['x = purify.js' + C + '3;'],
    exempt: [{ file: 'a.js', line: 1, text: 'x = purify.js' + C + '3;' }],
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
    exempt: [{ file: 'a.js', line: 1, text: 'x = purify.js' + C + '3;' }],
    wantBreaches: 1, // line 1 exempt, line 2 (same hit text, different citing line) still fires
  },
  {
    // The C1 defect this fixture used to be labelled for, but a `codex exec --sandbox
    // read-only` round drove audit() directly and showed a SET-based identity still let a
    // real-file path swap at a FIXED (file,line) through, because the swap does not change the
    // hit COUNT, only its stripped VALUE. Reproduces the branch's own C1 report against the
    // real node_modules exemption: a same-named in-repo file prefixed onto the exempted target.
    id: 'd16 C1 FIX — a same-basename path swap at a fixed (file,line) now FIRES',
    file: 'a.js', lines: ['x = lib/purify.js' + C + '3;'], // path swapped in, same stripped hit
    exempt: [{ file: 'a.js', line: 1, text: 'x = purify.js' + C + '3;' }], // records the OLD text
    wantBreaches: 1,
  },
  {
    // Contract cell 37: SPAN has no right boundary, so a column suffix truncates to the same
    // stripped hit as the un-suffixed citation. A hit-based identity (even a full-set one)
    // cannot see this edit; a full-line-text identity does, because the line itself changed.
    id: 'd16/cell37 a column suffix appended at a fixed (file,line) now FIRES',
    file: 'a.js', lines: ['x = purify.js' + C + '3:9;'],
    exempt: [{ file: 'a.js', line: 1, text: 'x = purify.js' + C + '3;' }],
    wantBreaches: 1,
  },
  {
    id: 'identity truth table — recorded "line" wrong fails',
    file: 'a.js', lines: ['x', 'y = purify.js' + C + '3;'],
    exempt: [{ file: 'a.js', line: 1, text: 'y = purify.js' + C + '3;' }], // recorded line 1, real is 2
    wantBreaches: 1,
  },
  {
    id: 'identity truth table — recorded "file" wrong fails',
    file: 'a.js', lines: ['x = purify.js' + C + '3;'],
    exempt: [{ file: 'b.js', line: 1, text: 'x = purify.js' + C + '3;' }],
    wantBreaches: 1,
  },
  {
    id: 'identity truth table — a purely cosmetic reword of the SAME citation still fails',
    file: 'a.js', lines: ['x = purify.js' + C + '3; // updated wording'],
    exempt: [{ file: 'a.js', line: 1, text: 'x = purify.js' + C + '3;' }],
    wantBreaches: 1,
  },
  {
    id: 'dcont-21 duplicate identical hits, full line text matches — BOTH exempted together',
    file: 'a.js', lines: ['purify.js' + C + '3 and purify.js' + C + '3 again'],
    exempt: [{ file: 'a.js', line: 1, text: 'purify.js' + C + '3 and purify.js' + C + '3 again' }],
    wantBreaches: 0,
  },
  {
    id: 'dcont-21 duplicate identical hits, text does not match — BOTH fire together',
    file: 'a.js', lines: ['purify.js' + C + '3 and purify.js' + C + '3 again'],
    exempt: [{ file: 'a.js', line: 1, text: 'purify.js' + C + '3 alone' }],
    wantBreaches: 2,
  },
];

// A literal, hand-maintained count — bump it in the SAME change as any fixture addition or
// removal. Round-1 review: a computed `>= 30` floor left six fixtures free to disappear
// unnoticed. This mismatches on ANY change to the arrays above, not just a shrink.
export const REQUIRED_FIXTURES = 46;
