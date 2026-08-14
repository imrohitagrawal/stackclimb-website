/* The two-ledger act (package 4B, D57 act 01, RCA-002). Two populations, two
 * proof rules, never mixed — the footer's closing sentences state the rule;
 * this file is the data that has to obey it.
 *
 * employerRows — CAREER outcomes from the owner's CV via cv.js (D36's
 * authoritative source; RCA-005/P-21: the ledger depicts the overall
 * career, not one tenure). No employer name renders anywhere in the act —
 * `job` is a BINDING, never rendered: tests/proof-data.spec.js captures
 * each row's figure from its own bullet inside its own cv.js job entry,
 * and proof-act.spec.js proves /cv renders that job's name with the figure
 * — attribution by name is one click deep, by machine. Marked approximate
 * at ledger level (ruling 1). Rows are picked for OUTCOME distinctness
 * (P-18, owner reviews the render); Oracle's regression-execution and
 * root-cause rows stay on /cv only (RCA-005, recorded).
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

/* The qualifier depicts the career in the hero's own words. A dated span
   (July 2011 – April 2026) was REJECTED by the plan fan: cv.js holds no
   outcome figure before April 2015, so dates over these rows would be the
   label-wider-than-content class RCA-005 exists to fix. The two FACTS here
   are gated against cv.js in proof-data.spec.js: experience spans ≥ 14
   years and carries exactly six employers. */
export const qualifier = 'Approximate · Fourteen years, six employers';

export const employerRows = [
  {
    t: 'Manual test design',
    d: '~40% less effort',
    job: 'Oracle',
    point: /manual test design effort by (40)%/i,
    figures: ['40'],
  },
  {
    t: 'Automation coverage',
    d: '65% → 95%',
    job: 'Oracle',
    point: /from (65)% to (95)%/i,
    figures: ['65', '95'],
  },
  {
    t: 'Production incidents',
    d: '~20% fewer',
    job: 'Oracle',
    point: /production incidents by (20)%/i,
    figures: ['20'],
  },
  // NEW to the act (never shipped before — named for the owner's render
  // review): LimeRoad's payment figure. Chosen over Amazon's coverage and
  // regression figures, which duplicate topics the Oracle rows already carry.
  {
    t: 'Payment defects in production',
    d: '~25% fewer',
    job: 'LimeRoad',
    point: /payment-related production defects by (25)%/i,
    figures: ['25'],
  },
  {
    t: 'Release validation',
    d: '~35% less manual effort',
    job: 'Mobileum',
    point: /release-validation effort by roughly (35)%/i,
    figures: ['35'],
  },
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
    d: 'Your air, not the city average — readings labelled live, cached, or no reading.',
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
