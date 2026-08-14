/* The two-ledger act (package 4B, D57 act 01, RCA-002). Two populations, two
 * proof rules, never mixed — the footer's closing sentences state the rule;
 * this file is the data that has to obey it.
 *
 * employerRows — Oracle-tenure outcomes from the owner's CV via cv.js (D36's
 * authoritative source). Attribution lives ONCE, in the ledger heading —
 * never inside a row (RCA-002 ruling 2). Marked approximate at the ledger
 * level (ruling 1); `point` CAPTURES the exact figure from its cv.js Oracle bullet — tests/proof-act.spec.js fails a row whose figure is missing
 * from ITS OWN point (token-anywhere passes swapped figures; cv.js carries
 * 25 twice and 20 three times). The two near-duplicate −25% regression
 * claims (effort, time) are merged into one row; flaky −20% and production
 * defects −20% stay on /cv only (plan amendment, recorded).
 *
 * capabilityRows — one plain-English clause per system (P-15: reader first,
 * mechanism second), phrased from the owner-approved overview lines.
 * `file` + `term` are the evidence trace: the term must appear in the
 * rendered sentence AND in that docs/evidence/projects/ file, so a reworded
 * claim loses its trace and goes red. No status words here: NarraTwin's
 * No-Go and EvalAxis's closed state are disclosed on the overview, the
 * plates and the project pages (ruling 3 — placement, not deletion).
 */

/* D62 — replaces D60's line at the owner's decision. Verbatim. */
export const definition =
  'StackClimb is where Rohit Agrawal builds independent AI systems — outside any employer.';

/* The thesis line (RCA-002 ruling 6). "Four": only four repos are public, so
   the invitation to check must survive the reader trying — flagged as the
   owner's named decision in the PR; his ruling lands in D85. */
export const thesis =
  'Fourteen years I can tell you about. Four systems you can check yourself.';

export const employerRows = [
  { t: 'Manual test design', d: '~40% less effort', point: /manual test design effort by (40)%/i, figures: ['40'] },
  { t: 'Automation coverage', d: '65% → 95%', point: /from (65)% to (95)%/i, figures: ['65', '95'] },
  { t: 'Regression execution', d: '~25% faster', point: /regression execution (?:effort|time) by (25)%/i, figures: ['25'] },
  { t: 'Production incidents', d: '~20% fewer', point: /production incidents by (20)%/i, figures: ['20'] },
  { t: 'Root-cause analysis', d: '~35% faster', point: /root-cause analysis by (35)%/i, figures: ['35'] },
];

export const capabilityRows = [
  {
    t: 'CiteVyn',
    d: 'Answers only what it can cite, and refuses the rest.',
    file: 'citevyn.md',
    term: 'refus',
  },
  {
    t: 'Quorum-AI',
    d: 'Four models answer; a moderated critique maps their disagreement.',
    file: 'quorum-ai.md',
    term: 'moderat',
  },
  {
    t: 'SaafSaans',
    d: 'Your risk, not the city’s — every reading labelled live, cached, or none.',
    file: 'saafsaans.md',
    term: 'labelled',
  },
  {
    t: 'NarraTwin AI',
    d: 'Cited walkthroughs; every claim is checked against its source.',
    file: 'narratwin.md',
    term: 'claim',
  },
  {
    t: 'EvalAxis',
    d: 'A regression gate that fails the build when quality drops — private, in progress.',
    file: 'private.md',
    term: 'regression gate',
  },
];
