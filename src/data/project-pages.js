/* Per-system depth — the material that only appears on /projects/<slug>.
 *
 * `body` is the system's descriptive prose, and it has TWO consumers: the home plate
 * renders `body[0]`, the project page renders all of it. One source, so the two
 * surfaces cannot drift apart — which is exactly the defect DEF-27 and DEF-29 record,
 * where one fact was stated verbatim in two places and the fix regressed in one.
 *
 * Everything else the project page needs — the proof line, the panel, the caption
 * strip, the engineering paragraph and the `notClaimed` list — is read from
 * src/data/projects.js for the same reason.
 *
 * `record.now` and `record.gaps` are the two lists the site did not previously
 * carry anywhere. Every line traces to docs/evidence/projects/<name>.md or to a
 * source line quoted inside it. Nothing here is written from a README: two review
 * rounds found nine figures that had been, and every one was wrong in the
 * flattering direction (D65, D68).
 *
 * The third column is derived from `projects.js`'s `notClaimed`, not restated here.
 *
 * If you change a line, change the evidence file in the same commit and carry its
 * command and commit SHA across.
 */

export const pages = {
  citevyn: {
    body: [
      'Citation-grounded Q&amp;A over official AI documentation. Answers quote their sources verbatim; ' +
        'where no source supports an answer, CiteVyn refuses instead of guessing. Index updates reach ' +
        'production only through an evaluation gate.',
    ],
    record: {
      now: [
        'Refuses when no source supports the answer, rather than guessing',
        'Each index is stamped with the model that built it; a stamp that disagrees drops the vector arm to zero',
        'A 15-case retrieval suite runs against the <em>candidate</em> index and refuses promotion ' +
          'below a 0.95 pass rate',
        'Every promotion writes an audit entry — on the clean path and the forced one alike',
        'Intent is routed and labelled on screen: usage, exact lookup, how-to, out of scope',
      ],
      gaps: [
        'Retrieval surfaces in-domain chunks on 5 of 19 near-miss refusal cases. The answer layer refused every one',
        '53 golden case files exist on disk; 52 ran in the recorded report',
        'An unstamped legacy index is let through on purpose',
        'An operator can force promotion past a failing rate — the override is written to the audit trail ' +
          'with the measured rate',
        'Cost controls layer 4 is in-process only; <code>make budget</code> is planned, not implemented',
      ],
    },
  },

  quorum: {
    body: [
      'One question runs against four models in parallel. A separate moderator pass — its own call, with ' +
        'its own configured model — reads all four answers and critiques them over two rounds; a round ' +
        'dropped for time is recorded as skipped, not hidden. The four never read each other. A synthesis ' +
        /* The sentence that used to close this paragraph — "the cost is approved
           before anything runs, and any fallback or simulation is disclosed" — is
           the Gate line rendered directly beneath it, word for word. Two statements
           of one fact on one plate is DEF-27, and it cost this plate 20px it did
           not have. The Gate line keeps it; the paragraph gives it up. */
        'then returns consensus, disagreement, source support, uncertainty, and a recommendation.',
    ],
    record: {
      now: [
        'Four models answer in parallel; a separate moderator pass critiques them over two rounds',
        'The four never read each other — there is no code path on which they could',
        'Cost is approved before anything runs',
        'Any fallback or simulation is disclosed on screen, never hidden',
        'A reader that times out marks itself, so a verdict-less result is never cached over a verified one',
      ],
      gaps: [
        'Round 2 is skipped when the per-run debate budget runs out, and recorded as skipped',
        'Live execution is off by default — the interface says the output is local simulation',
        'Consensus is lexical: 4-gram overlap and negation heuristics, captioned ' +
          '<em>“inferred, not a tallied vote”</em>',
        'The moderator’s default model id is the same as answer slot 2’s. It is a fifth call in a separate ' +
          'role, not a fifth model',
        'The mutation gate is advisory in CI. Promotion to blocking was built, measured, and reversed',
      ],
    },
  },

  saafsaans: {
    body: [
      /* Two sentences came out of this paragraph on 2026-08-12, and neither claim
         left the site. "Every reading is labelled with where it came from: live,
         cached, or no reading at all" is the Rule line rendered on the same plate,
         and it is the first row of `Works now` on the project page. "There is no
         sample mode" states an absence the site never claims the presence of —
         D74 removed the SAMPLE chip, so there is nothing left to deny. The Hindi
         banner stays: it is a disclosure a reader acts on, not a restatement. */
      'A Delhi-NCR air-quality companion that scores your risk — age, condition, planned activity — ' +
        'rather than the city’s average, across a repo-stated 21 stations, and answers questions with ' +
        'cited health guidance. The Hindi draft ships behind a banner saying no Hindi speaker has ' +
        'reviewed it yet.',
      'Entered at <em>Build with AI</em> (Elastic × GDG Cloud New Delhi, 18 July 2026) as a four-tab ' +
        'Streamlit app that already existed, then rebuilt over the next three days into what runs today. ' +
        'It lives on one small machine that suspends when idle and wakes on request, so the first visit ' +
        'after a quiet spell takes a moment. It went down on 21 July and was redeployed on 9 August; ' +
        'while it was down, this page said so rather than leaving you to find out by clicking.',
    ],
    record: {
      now: [
        'Scores your risk — age, condition, planned activity — not the city average',
        'Every reading is labelled with where it came from: <b>LIVE</b>, <b>CACHED</b>, or <b>NO READING</b>',
        'Picks one whole reading and never blends two feeds, so a figure never wears one station’s name ' +
          'and another’s timestamp',
        'An AQI ladder and a persona ladder both run, and the stricter verdict wins',
        'A test fails the build if any risk weight carries neither a source nor a disclaimer',
      ],
      gaps: [
        'Two of 21 stations map to no feed — Ashok Vihar and Nehru Nagar',
        'The Hindi draft ships behind a bilingual banner: no Hindi speaker has reviewed it',
        'The prompt guard names the bypass it does not stop — one Cyrillic letter passes every pattern',
        'The time-window strip recommends late morning at 5:00 PM. A defect, under repair, and stated',
        'No serialised evaluation artefact exists — there is no stored run to quote',
      ],
    },
  },

  narratwin: {
    body: [
      'Grounded walkthrough generation with citations, claim evaluation, consent checks, and release ' +
        'gates that run before anything is generated. Its own release-readiness review currently reads ' +
        'No-Go — so it is not deployed, and this page says so.',
      'It is shown anyway, because the gate holding is the point.',
    ],
    record: {
      now: [
        'Twenty-five languages proved to agree across five surfaces against a pinned fixture',
        'Consent is checked, and external web is disabled by policy, before any presenter is generated',
        'In the Google path, budget is reserved <b>before</b> anything leaves the machine, and replays ' +
          'are fingerprinted',
        'A failure landing where bytes may already have gone becomes <b>BILLABLE_UNKNOWN</b> — refused on ' +
          'retry rather than billed twice',
        'The Google TTS path re-verifies the peer address before the TLS wrap, closing a DNS-rebinding window',
      ],
      gaps: [
        'Its own release-readiness review reads <b>No-Go</b>, so it is not deployed',
        'The ElevenLabs path in the same file does not do this yet — it retries a timeout straight through',
        'The evaluation report carries no tested commit SHA and predates current HEAD, so it does not ' +
          'establish that today’s HEAD passes',
        'The eval-smoke result has never been committed; only the harness that produces it is in the repo',
        'Its architecture document still opens “blocked until Stage 4 gate approval”, and undersells the code',
      ],
    },
  },
};
