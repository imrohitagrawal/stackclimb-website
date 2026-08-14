# RCA-005 — The employer ledger shipped scoped to one tenure while depicting the career

**Status: written before the fix, per the AGENTS.md order. Approval: the owner directed the
change in conversation on 2026-08-15 (two messages: remove "— Oracle tenure" from the
heading; "this depicts my overall career and not just Oracle").**

## What happened

Package 4B shipped the two-ledger act's employer ledger as an Oracle-tenure surface: heading
`Employer outcomes — Oracle tenure`, qualifier `APPROXIMATE · APRIL 2019 – APRIL 2026`, and
five rows all drawn from cv.js's Oracle bullets. The act sits under the hero's thesis line —
"Fourteen years I can tell you about" — and D57 names it the professional-proof act for the
whole career. One tenure was standing in for fourteen years, one plate below the sentence
that promises them.

## Where it was introduced

At the **plan-amendment stage of 4B**. The seven-lens fan's uiux BLOCK (the 900px height
budget) forced the row count to five, and the cut dropped Amazon and Mobileum as
"near-duplicates of kept rows". That fold answered the height question and silently changed
the ledger's MEANING — from career evidence to tenure evidence — and the "— Oracle tenure"
suffix was then added as the patch that made the narrowed content labelled-honest. Honest,
but the wrong surface: the label followed the cut instead of the cut following the purpose.
The same mechanism RCA-002 records — an internal constraint picking the copy — one package
later, one level up.

## Where it was caught

By the owner, on the open PR render flow, 2026-08-15 — after merge to production. No plan
lens, built lens, or verifier asked "does one tenure depict the fourteen years the hero just
claimed?" The recruiter lens judged rows for legibility (P-15) and the peer lens for figure
validity (ruling 4); nobody owned the question of scope against D57's stated purpose.

## Cost

A remedial package (this one); the owner's correction arriving as two conversation messages;
a disagree-before-comply round that argued attribution when the actual defect was scope —
the raised conflict was real (removing the suffix alone would have left unattributed
figures), but the diagnosis behind the instruction only surfaced in his second message.

## The owner's ruling (2026-08-15, recorded here and in the register as P-21)

The employer ledger depicts the **overall career**, not the Oracle tenure. The heading drops
the suffix. Consequences, applying his standing rulings to the new scope:

1. **Rows must span the career for the label to be true** — an unscoped heading over
   all-Oracle rows would be the overclaim the voice rule bans. Two Oracle rows yield to two
   non-Oracle figures validated in cv.js. (This sentence first said "both shipped in D84
   before 4B cut them" — half-false, corrected by the plan fan: D84's pair was Amazon and
   Mobileum; the plan selects Mobileum and **LimeRoad's payment figure, which is NEW to the
   act** and is named as new copy for the owner's render review.)
2. **Qualifier line depicts the career without overclaiming the rows** —
   `APPROXIMATE · FOURTEEN YEARS, SIX EMPLOYERS`. The plan's first draft said
   `JULY 2011 – APRIL 2026`; the fan confirmed that a dated span implies the rows evidence
   it, and cv.js holds no outcome figure before April 2015 (Subex and Snapdeal carry none) —
   the label-wider-than-content class this RCA exists to fix, one notch smaller. "Fourteen
   years, six employers" states the career (both facts derived from cv.js and gated:
   span ≥ 14 years, `experience.length` = 6) and matches the hero's own thesis words.
3. **P-16 holds as written** — no employer name inside rows. With the heading unscoped, no
   employer name renders anywhere in the act; attribution by name is performed on `/cv`,
   where every figure sits under its employer (already gated), and machine-checked in the
   drift gate, which binds each row's figure to its own bullet **inside its own job entry**.
   The footer's "attributed to their employer" is site-true, one click deep. Flagged to the
   owner in conversation; his intent stood.

## The need

The act is the career-proof surface (D57). Until it spans the career, the site's centrepiece
under-delivers its stated purpose for the second package running.

## The fix (one package)

`proof.js`: five career rows (three Oracle, one LimeRoad, one Mobileum — selection is
presentation, P-18, owner reviews the render), each with a `job` binding for the per-job
drift gate. `ProofPlate.astro`: heading `Employer outcomes`, qualifier
`Approximate · July 2011 – April 2026`. Gates: meta full-string moves; the heading-contains-
Oracle assertion inverts to no-employer-anywhere-in-the-act; the drift gate binds per job.
Records: this RCA · P-21 · D87 · P-16 row noted. Process fix: **the plan fan gains a scope
question** — every act-level surface is judged against the purpose D57 assigns it, not only
for accuracy and legibility.
