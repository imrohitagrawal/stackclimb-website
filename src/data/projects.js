/* Panel content for the four systems that carry an artefact.
 *
 * Every figure here was re-derived at HEAD on 2026-08-11 and traces to a line in
 * docs/evidence/projects/. Nothing is copied from a README — two review rounds
 * found nine figures that had been, and every one was wrong in the flattering
 * direction (D65, D68). If you change a number here, change the evidence file in
 * the same commit and carry its command and commit SHA across.
 *
 * `strip` is the caption strip: LABEL over VALUE, per DESIGN.md's billing cells.
 * `notClaimed` is its own field because it is the one cell that must never be
 * dropped for space — it is the site's argument, not decoration.
 */

export const projects = {
  citevyn: {
    proof: 'Twenty-six answerable questions. It found the right source for <em>every one</em>.',
    shot: 'citevyn-demo',
    crop: 'citevyn-crop',
    alt:
      'CiteVyn answering a question about Claude Code, with two numbered citations to real ' +
      'docs.claude.com pages',
    prov: 'Committed visual baseline, citevyn at df8cfc3. Both citations are real documentation URLs.',
    eng:
      'Swap the embedding model without re-indexing and cosine distance quietly stops meaning ' +
      'anything: same dimensions, wrong space, confident citations to the wrong page. A dimension ' +
      'check cannot see it. So each index is <b>stamped with the model that built it</b>, and a ' +
      'stamp that disagrees drops the vector arm to zero rather than rank against the wrong ' +
      'space. An unstamped legacy index is let through on purpose.',
    strip: [
      { t: 'Retrieval', d: '1.0 hit-rate · 26 answerable' },
      { t: 'Judge', d: '4.63 / 5 · 54 judged' },
      /* Was 'Release gate — 52/52 golden cases'. The golden suite is deliberately
         NOT the promotion gate: promotion_eval.py's own docstring calls wiring it
         in "wrong, and deliberately not taken", because it measures a fixture
         corpus and would certify an index that was never tested. The gate is a
         separate 15-case retrieval suite on the candidate index. */
      { t: 'Golden suite', d: '52 / 52 cases' },
      { t: 'Tests', d: '1,036 backend · 125 e2e' },
    ],
    notClaimed: 'Corpus scale · adoption · SLA',
  },

  quorum: {
    proof:
      'Disagreement and uncertainty come back as <em>their own fields</em>, not folded into one ' +
      'confident answer.',
    shot: 'quorum-run',
    crop: 'quorum-crop',
    alt:
      "Quorum-AI's verdict panel reading '4 of 4 models aligned, 3 revised their position', " +
      'with a note that only 13% of claims carried citations',
    prov:
      'SAMPLE — an end-to-end acceptance fixture rendering canned data ' +
      '(e2e/fixtures/golden-run.ts), not a measured run. Live execution is off by default. The ' +
      'revision count is inferred from position movement, and the interface says so.',
    eng:
      // The mechanism itself now sits in the plate body above (ADR-0032), so this
      // line starts at the engineering, not by restating it a second time.
      'The eval judge is a paid call several threads ' +
      'may need at once, so the first thread makes it and the rest wait on that one future. A ' +
      'reader that times out marks itself, so a verdict-less result never gets cached over a run ' +
      'the judge did verify. Its production readiness review records a Go dated 21 June and the ' +
      'No-Go it superseded five days earlier. Both are kept in the file.',
    strip: [
      { t: 'Tests', d: '2,095 python · 358 e2e' },
      { t: 'Coverage floor', d: '88%, enforced in config' },
      { t: 'Decisions', d: '32 ADRs, each named' },
      { t: 'Limits', d: '16 concurrent · 180s deadline' },
    ],
    notClaimed: 'Latency · accuracy · adoption',
  },

  saafsaans: {
    proof:
      'Two people, one sky. The senior with asthma scores <em>76</em>. The healthy adult, same ' +
      'plans, scores <em>64</em>.',
    shot: 'saafsaans-en',
    crop: 'saafsaans-crop',
    alt:
      'SaafSaans showing a risk score of 76 out of 100 for an adult with asthma beside 64 for a healthy ' +
      'adult on the same plans',
    prov:
      'Captured live 11 Aug 2026, 5:00 PM. Cropped above a time-window strip showing a defect ' +
      'under repair.',
    eng:
      'The breathing rates behind the exertion term are EPA&rsquo;s published figures. <b>Which ' +
      'activity counts as which intensity is not</b>: that mapping is a judgement, and the code ' +
      'says so in as many words. Every weight ships carrying either its source or its ' +
      'disclaimer, and a test fails the build if one carries neither.',
    strip: [
      { t: 'Risk delta', d: '76 vs 64 · identical plans' },
      { t: 'Feeds', d: '19 live · 2 known gaps' },
      { t: 'Tests', d: '771 functions · 16,199 lines' },
      { t: 'Guard', d: '39 patterns · EN, Hindi, Hinglish' },
    ],
    notClaimed: 'Medical advice · uptime',
  },

  narratwin: {
    proof:
      'Twenty-five languages, six script classes. Every one proved to agree across five surfaces ' +
      'against a <em>pinned fixture</em>.',
    shot: 'narratwin-demo',
    crop: 'narratwin-crop',
    alt:
      'NarraTwin interface design: a simulated host context panel, a consent checkbox before any ' +
      'presenter is generated, and external web disabled by policy',
    prov:
      'SAMPLE — interface design, not a running capture. No screenshot of the built system exists ' +
      'yet, so this stands in and is labelled rather than implied.',
    eng:
      'In the Google TTS path, budget is reserved <b>before</b> anything leaves the machine, ' +
      'replays are fingerprinted, and a failure landing where bytes may already have gone becomes ' +
      '<b>BILLABLE_UNKNOWN</b>: refused on retry rather than risk billing twice. The ElevenLabs ' +
      'path in the same file does not do this yet; it retries a timeout straight through.',
    strip: [
      { t: 'State', d: 'Phase 1 — No-Go · not deployed' },
      { t: 'Languages', d: '25 · 6 script classes' },
      { t: 'Surface parity', d: '25 / 25 agree' },
      { t: 'Code', d: '25,606 lines · 1,668 tests @639aa2c' },
    ],
    notClaimed: 'Deployment · video · avatar Q&A',
  },
};
