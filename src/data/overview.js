/* The overview index — six systems, two groups, one row each.
 *
 * DERIVED, NEVER RESTATED. Name, state and figure for the four public systems
 * are read from projects.js at build time, so a state change there propagates
 * here without a second edit — the proxy-of-source mechanism D79 diagnosed
 * three times is exactly what this file must not rebuild. Only `line` (the
 * plain-English row line, owner's directive 2026-08-14: a sentence a
 * non-technical reader can picture, doubling as the example) is authored here.
 *
 * Group order inside `Being built` is a recorded decision, D60: Aegis →
 * EvalAxis → NarraTwin, so the band closes on NarraTwin's No-Go — a gate that
 * held is a disclosure, and the last row carries peak-end weight.
 */
import { projects } from './projects.js';
import { privateSystems } from './private-systems.js';

const lines = {
  citevyn: 'Answers from official docs and shows its sources — or says it can’t.',
  quorum: 'Asks four AI models the same question and shows where they disagree.',
  saafsaans: 'Scores your air risk for today — yours, not the city average.',
  narratwin: 'Turns project knowledge into cited walkthroughs; its own gate says not yet.',
};

/* One figure per row, picked from the caption strip BY LABEL so a renumbering
   of the strip cannot silently swap which figure the index shows. */
const figureLabel = {
  citevyn: 'Golden suite',
  quorum: 'Coverage floor',
  saafsaans: 'Feeds',
  narratwin: 'Surface parity',
};

const pub = (slug) => {
  const p = projects[slug];
  const cell = p.strip.find((s) => s.t === figureLabel[slug]);
  if (!cell) throw new Error(`overview.js: no strip cell "${figureLabel[slug]}" on ${slug}`);
  return {
    slug,
    name: p.name,
    state: p.state,
    line: lines[slug],
    figure: `${cell.t} — ${cell.d}`,
    href: `/projects/${slug}`,
  };
};

const closed = (key) => {
  const s = privateSystems[key];
  /* No href: the system has no page, and an absent link is correct where a
     disabled one would imply the thing exists ([slug].astro's own rule). */
  return {
    slug: key,
    name: s.name,
    state: s.state,
    line: s.line,
    figure: s.figure,
    href: null,
  };
};

export const overview = {
  heading: 'What you can use, and what is still being built',
  groups: [
    { label: 'Use them now', rows: ['citevyn', 'quorum', 'saafsaans'].map(pub) },
    { label: 'Being built', rows: [closed('aegis'), closed('evalaxis'), pub('narratwin')] },
  ],
};
