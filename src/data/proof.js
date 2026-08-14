/* The two-ledger act (package 4, D57 act 01). Two populations, two proof rules,
 * never mixed — the footer's closing sentences state the rule; this file is the
 * data that has to obey it.
 *
 * employerRows — self-reported outcomes from the owner's CV, via cv.js (D36's
 * authoritative source; the cv.js line for each row is cited beside it).
 * Labelled once at the ledger heading, `~`-marked, and attributed to the
 * employer in the same row. Exact attribution or nothing: there is no
 * "release validation −25%" anywhere in the record, and nothing here may
 * invent one.
 *
 * builtRows — the four built systems (the hero strip's `Built 4`, D82: the
 * heading names its own denominator so a subset cannot read as concealment).
 * Counted figures at recorded versions. tests/proof-act.spec.js fails if a
 * numeric token here is missing from the matching caption-strip cell in
 * projects.js, or if a sha here is absent from the system's evidence file —
 * so this surface cannot drift from the ones below it (the 771→767 lesson,
 * D83/W-1).
 */

/* D62 (docs/STATUS.md:54) — replaces D60's line at the owner's decision;
   "product studio" is dropped. Verbatim, em-dash tail included. */
export const definition =
  'StackClimb is where Rohit Agrawal builds independent AI systems — outside any employer.';

export const employerRows = [
  { t: 'Oracle', d: 'Root-cause analysis accelerated ~35%' }, // cv.js:67
  { t: 'Oracle', d: 'API automation coverage 65% → 95%' }, // cv.js:66
  { t: 'Amazon', d: 'UI and API automation coverage up ~25%' }, // cv.js:80
  { t: 'Mobileum', d: 'Manual release-validation effort down ~35%' }, // cv.js:103
];

/* slug/cell name the projects.js caption-strip cell the figures must agree
   with; file names the evidence file the sha must appear in. */
export const builtRows = [
  {
    t: 'CiteVyn',
    d: '1,036 backend test functions · 125 e2e tests @df8cfc3',
    slug: 'citevyn',
    cell: 'Tests',
    file: 'citevyn.md',
  },
  {
    t: 'Quorum-AI',
    d: '2,095 Python test functions · 358 e2e @d3c860c',
    slug: 'quorum',
    cell: 'Tests',
    file: 'quorum-ai.md',
  },
  {
    t: 'SaafSaans',
    d: '767 test functions @10f4213',
    slug: 'saafsaans',
    cell: 'Tests',
    file: 'saafsaans.md',
  },
  {
    t: 'NarraTwin AI',
    d: '1,743 tests @a022862 · its own gate says No-Go',
    slug: 'narratwin',
    cell: 'Code',
    file: 'narratwin.md',
  },
];
