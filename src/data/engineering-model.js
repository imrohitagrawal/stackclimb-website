/* The eight-stage engineering operating model for /how-i-build's interactive
 * tabs (P-18: presentation delegated, evidence sourced and audited).
 *
 * The four group labels and the two-substage split under each are VERIFIED
 * from the owner's own GitHub profile README (imrohitagrawal/imrohitagrawal,
 * "How I deliver trustworthy systems" section) — not invented for this page.
 *
 * Every `system` line traces to docs/evidence/: the four public projects'
 * own evidence files, or docs/evidence/projects/private.md's 2026-09-01
 * audit of Aegis Contracts and EvalAxis (read via `gh api`, since neither is
 * a public repo — Aegis is not even cloned locally). Every `employer` line
 * traces to src/data/cv.js's Oracle entry or the profile README directly,
 * both already labelled Approximate where the figure is a percentage.
 */

export const groups = [
  { key: 'understand', label: 'Understand', artifact: 'decision brief' },
  { key: 'deliver', label: 'Design & Deliver', artifact: 'system boundary' },
  { key: 'assure', label: 'Assure & Ship', artifact: 'release evidence' },
  { key: 'improve', label: 'Run & Improve', artifact: 'learning backlog' },
];

export const stages = [
  {
    num: '01',
    key: 'discover',
    group: 'understand',
    label: 'Discover',
    heading: 'Discover — find the customer problem',
    body:
      'Customer conversations, UAT sessions and production complaints, read for the problem ' +
      'underneath the request — before anything gets designed.',
    employer:
      'Customer delivery, UAT, troubleshooting and stakeholder collaboration across Oracle ' +
      'Analytics, on Oracle Cloud Infrastructure and Oracle Analytics Cloud.',
    system:
      'SaafSaans exists to answer one practical question directly: what does current air ' +
      'quality mean for my plans, and when might conditions improve?',
    terms: ['customer problem', 'users', 'outcomes'],
  },
  {
    num: '02',
    key: 'frame',
    group: 'understand',
    label: 'Frame',
    heading: 'Frame — write the assumption down',
    body:
      'Requirements, constraints, risks and data, turned into acceptance criteria specific ' +
      'enough to test — and non-goals named, not implied.',
    system:
      'Aegis Contracts tags every assumption CONFIRMED (the owner’s input) or DEFAULT ' +
      '(change-controlled) in one file. Nothing is silently assumed.',
    terms: ['requirement', 'acceptance criterion', 'risk & ambiguity log', 'non-goals'],
  },
  {
    num: '03',
    key: 'architect',
    group: 'deliver',
    label: 'Architect',
    heading: 'Architect — contracts before code',
    body:
      'Systems compose when their boundaries are versioned. The artifact schema, the ' +
      'traceability model and the event catalogue get designed first, so tools underneath ' +
      'them can be replaced without renegotiating what anything means.',
    employer:
      'Architected AI-driven quality engineering frameworks across enterprise cloud services ' +
      'at Oracle.',
    system:
      'Aegis Contracts — three versioned contracts: a canonical artifact schema, a ' +
      'traceability node/edge/coverage model, and a CloudEvents catalogue. Frozen at v0.1.2, ' +
      'additive-only within v1. Coverage is computed at the acceptance-criterion level, as a ' +
      'first-class object, not a spreadsheet column.',
    terms: ['requirement → criterion', 'criterion → test', 'test → execution', 'defect → prod signal'],
  },
  {
    num: '04',
    key: 'build',
    group: 'deliver',
    label: 'Build',
    heading: 'Build — the AI workflow itself',
    body:
      'The workflows, integrations and platform capabilities that turn a design into a ' +
      'working system — including the AI-assisted parts, which get the same discipline as ' +
      'the rest.',
    employer:
      'LLM-assisted test generation, intelligent test selection, self-healing automation and ' +
      'predictive quality analytics, reducing manual test design effort by approximately 40%.',
    system:
      'NarraTwin AI delivers grounded scripts with citations, claim evaluation, consent ' +
      'checks and a release gate that runs before generation, not after.',
    terms: ['services & APIs', 'trust boundaries', 'AI workflows'],
  },
  {
    num: '05',
    key: 'evaluate',
    group: 'assure',
    label: 'Evaluate',
    heading: 'Evaluate — coverage that means something',
    body:
      'Coverage counted against acceptance criteria, not files. For AI systems the same ' +
      'discipline applies to faithfulness, relevancy, hallucination and retrieval precision — ' +
      'measured, baselined, and defended.',
    employer:
      'Automation coverage increased from 65% to 95%, cutting regression execution effort by ' +
      'approximately 25% and flaky tests by approximately 20%.',
    system:
      'EvalAxis scores five metrics — faithfulness, answer relevancy, hallucination, context ' +
      'precision, context recall — against a committed baseline. Its default judge is ' +
      'deterministic and runs offline: it proves the mechanism, not semantic quality.',
    terms: ['faithfulness', 'answer relevancy', 'hallucination', 'context precision', 'context recall'],
  },
  {
    num: '06',
    key: 'release',
    group: 'assure',
    label: 'Release',
    heading: 'Release — governance with a spine',
    body:
      'A release should be blockable for a stated reason and releasable on stated evidence. ' +
      'CI/CD and infrastructure are the plumbing; the gate policy is the judgement.',
    employer: 'Targeted release workflows reduced cycle time by approximately 25%.',
    system:
      'CiteVyn promotes a new retrieval index only when the newest completed evaluation run ' +
      'clears a stated pass-rate threshold — one transaction, gated, with an audit event on ' +
      'both the clean and the forced path.',
    terms: ['pass — within threshold', 'block — regression', 'warn — drift detected'],
  },
  {
    num: '07',
    key: 'operate',
    group: 'improve',
    label: 'Operate',
    heading: 'Operate — degraded modes are a feature',
    body:
      'Telemetry, canaries, alarms and runbooks decide how quickly a bad day ends. In AI ' +
      'systems the same instinct becomes visible mode labelling: the user should be able to ' +
      'tell whether an answer is live, deterministic, or a sample.',
    employer:
      'MTTD reduced by approximately 35% through telemetry and dashboards; production ' +
      'incidents reduced by approximately 20%.',
    system:
      'SaafSaans labels every answer live, deterministic or sample. Quorum-AI discloses a ' +
      'degraded run — forced into local simulation rather than spending against an ' +
      'untrustworthy cost ledger — and estimates cost before a run starts, not after.',
    terms: ['live', 'deterministic', 'sample', 'degraded'],
  },
  {
    num: '08',
    key: 'learn',
    group: 'improve',
    label: 'Learn',
    heading: 'Learn — production teaches the requirement',
    body:
      'The loop only closes when what happened in production edits what gets specified next: ' +
      'known limitations written down, baselines kept honest, evidence deciding what a system ' +
      'is allowed to claim — not enthusiasm.',
    employer:
      'Defined enterprise-wide quality engineering standards and governance while mentoring ' +
      '11+ quality engineers and SDETs globally.',
    system:
      'project-doc-skills — eight independent skills that turn a project into documentation, ' +
      'each in its own mode, with an independent review gate before anything publishes.',
    terms: ['known limitations', 'not-claimed list', 'next evidence needed'],
  },
];
