# RCA-002 — Proof language: verification vocabulary shipped where reader meaning belongs

**Status: written before the fix, per the AGENTS.md order. Approval: the owner directed the
rework in conversation on 2026-08-14 (three messages, quoted below); this document records
the cause before work starts.**

## What happened

Package 4 shipped the two-ledger act with row content that answers the wrong question. The
independent ledger carried test counts and commit stamps ("1,036 backend test functions
@df8cfc3") — figures that prove *re-derivability to the site's own tooling* but say nothing
a hiring manager can use. The employer ledger's label said "self-reported", which the owner
ruled against as working against him rather than reading as honest precision. The hero strip has the same defect one plate up:
"Golden cases passed 52 / 52" and "Release gates 4" are tokens a cold reader cannot finish
a sentence with. The owner caught all three on production, as the site's intended audience
would have.

## Where it was introduced

At the **plan stage**, twice over:

1. **P-15 was not treated as a plan input.** The directives register carries P-15 —
   *"copy aimed at recruiters carries a relatable, plain-English example, not only a
   technical descriptor"* — as a standing rule. The package-4 plan quoted D57/D60/D62/D80/
   D82 clause by clause and never opened the directives register for copy-governing rows.
   The D79 rule was applied to decisions, not directives.
2. **The owner's design reference was not used.** A screenshot showing the correct model —
   attribution once at ledger level, approximate-only marking, capability sentences instead
   of counts, a collective NOT CLAIMED line — had been shared twice before this package and
   was not consulted. Shared a third time on 2026-08-14, it was finally derived from.

A contributing mechanism: an internal constraint (the duplicate-statement ban — the
memorable per-system facts already render in the hero, overview and strips) was allowed to
*pick the copy*. Anti-duplication chose test counts; nobody then asked what the counts mean
to the reader. Internal mechanics outranked the message.

## Where it was caught

By the owner, on production, after merge — not by any of: the plan fan (its recruiter lens
flagged vocabulary at the wording level — "at named commits is developer vocabulary",
"unit-less figures" — but no lens rejected the row *concept*), the built-result fan, or the
round-2 reviewer. The review question asked was "is this accurate and parseable?" when the
brand question is "what would you tell the hiring manager this row means?"

## Cost

One shipped package whose centrepiece surface under-delivers its own purpose (D57's
60–90-second holistic proof); a second package now needed; three owner messages to
re-derive what the reference screenshot already showed; the hero discussion previously held
in conversation was never recorded in the ledger and had to be recalled by the owner —
a dropped instruction, the register's named failure pattern.

## The owner's rulings (2026-08-14, recorded here and in the ledger row for this package)

1. The employer ledger reads **APPROXIMATE** only — never "self-reported", which the owner
   ruled against on 2026-08-14. `AGENTS.md`'s voice-rule line is amended in the
   same change so rule and site do not disagree; D62's own kept sentence ("marked
   approximate") already agrees.
2. **No per-row employer naming.** Attribution once, at ledger level; rows carry the work
   and the measurable outcome. Safe practice, and cleaner.
3. **No "No-Go" in the act.** The NarraTwin row states capability; the No-Go disclosure
   stays where context explains it (overview row, NarraTwin plate, project page) — placement,
   not deletion.
4. The reference screenshot is a **design cue, not a spec** — figures in it must be
   validated against `cv.js` before shipping (two fail validation: "−30% test execution"
   does not exist in the CV; "Mean time to detect" is not the CV's term — the CV says
   root-cause analysis, and `MTTD` is a barred string).
5. **Presentation decisions are delegated**; the owner reviews rendered results, not option
   lists, for presentation-level choices. Decisions that alter facts, self-descriptions, or
   claims remain his.
6. The hero is not memorable and its rework was discussed before, never recorded — backfilled
   as a directive now.
7. **P-15 applies per surface, as a review question.** Recruiter-facing copy is judged by
   the decision it must support in the reader (D57's own stated purpose — the 60–90-second
   holistic view), not only by accuracy. Accuracy is necessary; legibility to the reader is
   the point. The 2026-08-08 amendment's line holds: the reader's problem, never his urgency.

## The need

The act and the hero are the two surfaces a scanner actually reads. Both currently speak
the site's internal verification dialect. The site's credibility argument only works if the
proof is legible to the person reading it.

## The fix (one package — same defect, two surfaces)

Rebuild the act to the reference model with validated figures; rebuild the hero strip
reader-verbal around the thesis line ("Fourteen years I can tell you about. Six systems you
can check yourself."); record rulings 1–6 in `docs/STATUS.md` and the directives register;
amend the AGENTS.md voice-rule line. Process fix: **the clause-by-clause rule extends to
the directives register** — every `P-` row that governs copy is mapped or refused in every
future plan.
