---
target: src/pages/cv.astro
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
timestamp: 2026-08-27T19-35-09Z
slug: src-pages-cv-astro
---
Method: dual-agent (A: design-review subagent · B: detector/browser + content-integrity subagents). Never critiqued before; no surface brief exists.

## Design Health Score — 24/40 (Acceptable, 60%)

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Nothing warns that collapsed panels will not print |
| 2 | Match System / Real World | 3 | "Visit"/"Evidence" name no destination; "The systems" is site jargon on a CV |
| 3 | User Control and Freedom | 3 | /cv is in no navigation on the site; no expand-all |
| 4 | Consistency and Standards | 2 | Status labels align to no column; colophon contradicts the page |
| 5 | Error Prevention | 1 | All three export paths silently emit an incomplete CV |
| 6 | Recognition Rather Than Recall | 2 | On paper: six product names, no explanation |
| 7 | Flexibility and Efficiency | 3 | Copy-as-text is a genuinely good ATS affordance |
| 8 | Aesthetic and Minimalist Design | 3 | Handsome on paper, undercut by 55% blank page 1 |
| 9 | Error Recovery | 3 | "Copy failed" reports honestly rather than faking success |
| 10 | Help and Documentation | 2 | The one instruction on the page is a promise it does not keep |

## Priority Issues

**[P0] The differentiating section is absent from every artefact the reader takes away.** Printed Independent Systems reads in full: "CiteVyn LIVE / Quorum-AI LIVE / SaafSaans DEPLOYED — SLEEPS WHEN IDLE / NarraTwin AI PHASE 1 — NO-GO / EvalAxis IN PROGRESS — CLOSED". Zero descriptions, zero GATE/RULE statements, zero Visit/Evidence URLs. `stackclimb` appears 0 times in the PDF — no route home. Same content missing from Copy as text (`copy-cv.js` clones with details shut). "NarraTwin AI — PHASE 1 — NO-GO" prints naked, inverting the site's most sophisticated honesty move into an admission of failure.

Cause: `cv-print.css:77` overrides `display:none` on children; Chrome now hides closed-details via `content-visibility` on `::details-content`. Right instinct, wrong mechanism. PROVEN FIX: `.cv-proj:not([open])::details-content { content-visibility: visible !important }` restores descriptions, GATE text, Visit and Evidence URLs. Plus `copy.querySelectorAll('details').forEach(d => d.open = true)` in `copy-cv.js`.

**[P0] Printed page 1 is 55% blank.** Under Chrome's real default margins (0.4in), page-1 ink fill is 38%; text stops at y=460 of 843. Cause: `cv-print.css:55` sets `.cv { padding: 0 }` but `global.css:84` sets `.plate { padding: clamp(...) }` at equal specificity and wins on source order. Measured under print media: padding-top 88px, min-height 720px, display grid, place-items center — the full-viewport plate machinery survives onto paper. PROVEN FIX: `.cv.plate { padding: 0 !important; min-height: 0; display: block }` takes page-1 fill 38% → 78%. NOTE: Playwright's DEFAULT margins give 78% and hide the defect — which is exactly the setting `pdf-text.spec.js` uses.

**[P0-adjacent] Neither print defect is gateable today.** `pdf-text.spec.js` anchors on "Rohit Agrawal", "Oracle", "Bengaluru" — all outside the details — and prints with default margins. It proves the text is well-formed; nothing proves it is complete.

**[P1] The colophon refutes the page it sits on.** Renders "Employer outcomes are attributed to their employer and marked approximate." `proof-cv.spec.js` is titled "no approximate disclaimer anywhere" and ENFORCES their absence per P-25. Two green gates, opposite directions, one sentence. The attribution clause is true; the "and marked approximate" tail must move. NOT a request to restore the disclaimer.

**[P1] Ochre carries six meanings across 36 elements.** Role title (1), links (11), section headings (6), employer names (6, NOT links), system states (6), gate labels (5). "The One Thread Rule" says small doses, stitching not upholstery. Six elements look exactly like the eleven links and are not clickable.

**[P1] Independent systems is not laid out.** `.cv-job-head` is `justify-content: space-between` with three items, so the status label lands at a different x on every row and the marker sits ~300px from it. The one place the page holds ledger data is the one place with no ledger rule.

**[P2] CiteVyn's state loses its qualifier here.** `Live` on /cv; `Live — cold-starts` on / and /projects/citevyn. /cv's Visit link is the one that sends a recruiter to a cold start unwarned. No parity test exists.

**[P2] /cv is in no navigation.** Only inbound links are the home page and /experience plate 2. A recruiter scanning for "CV" or "Resume" will not find it.

**[P3] Twenty numeric claims, nine of them "by 20%" or "by 25%".** Every bullet is verb-thing-percentage, so the eye finds no peak. Twenty numbers with no hierarchy read as none.

**[P3] Three tap targets under 24px at 390** — the contact trio (email 167.8x15, LinkedIn 50.4x15, GitHub 42.8x15), the line a recruiter taps first. WCAG 2.2 AA 2.5.8; axe does not implement it.

**[P3] "Visit" x4 and "Evidence" x4 as link text.** In a screen reader's links list these are eight indistinguishable entries; the parent details name does not enter the accessible name. "Visit" also points at a running product for CiteVyn/Quorum and at a GitHub repo for SaafSaans/NarraTwin — one word, two destinations. The home page already solves this.

**[P3] No structured data.** A schema.org/Person block would restate facts already on the page — zero new claims.

## Measured
4 pages printed under all margin settings. axe 0 violations, contrast 0 failures (135 nodes walked, bite-proofed 0→1), focus order clean (20 stops), min type 11px on screen / 8.64pt on paper (above the 8.25pt floor). Line measure: summary 72ch, bullets 71ch, scope 84ch. Desktop 3899px = 4.3 screens; mobile 6022px = 7.1 screens. No horizontal scroll 320–1920. No-JS identical but for the copy button, correctly absent. Detector: 33 em-dashes (advisory). Print gets right: tracking reset so headings extract as words, hrefs printed verbatim, mailto suppressing its own, grain layer dropped.
