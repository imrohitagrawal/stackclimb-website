# Package 5 — /experience and /how-i-build, then the nav (D57 clauses 8 and 9)

The queue's next package (handoff + D57). Home is the argument, subpages are the evidence:
these are the two evidence pages D57 promised, and the nav change is gated BEHIND them.

## Amendment record (round 1, before any code)

The plan fan (7 lenses) ran; Fable 5's usage limit stopped the verify phase mid-run (23 of
35 verifiers failed on quota, 12 completed with mixed results before that). Rather than
treat unverified agent claims as fact, **every structural claim below was re-checked
myself by reading the actual source** — cited inline. Convergence across independent
lenses (the palette-ladder contradiction was raised by 5 of 7; the PDF/chromium ordering
by 4 of 7) was corroborating, not sufficient on its own. This is v2 of the plan; v1's PDF
design is dropped entirely, not patched.

**The one finding that changes everything: `docs/STATUS.md` DEF-37 round 8 records the
owner's decision that `no-pii.mjs`'s `scan()` fails ANY tracked `.pdf`/`.docx` file
OUTRIGHT, unconditionally, without reading it — "this, not the content scanner, is the
real guarantee."** Verified: `grep -n "pdf-docx-unconditional" tests/no-pii.mjs` exists
and fires on any tracked PDF. v1 planned a build-time `dist/cv.pdf`. **That cannot ship —
not a gate to tune, a settled owner ruling from seven rounds of failed content-scanning.**
No conflict to raise with the owner here — this is my own plan colliding with his already-
settled decision, so the plan is the thing that's wrong, and it changes.

**Redesign:** "Download the CV" becomes **"Print or save the CV"**, linking to the
existing `/cv` page, whose print stylesheet (`cv.css:187` `@media print`) already produces
a clean one-page document via the browser's own Print → Save as PDF. Zero new binary in
`dist/`, zero CI wiring, zero gate conflict. This is materially SIMPLER than v1, not a
compromise — the feature v1 was building (a portable, current CV) already exists.

**Four more structural corrections, each verified against source before folding in:**

1. **`tests/palette-ladder.spec.js` harvests every `#id{--ground}` rule from ALL of
   `dist/_astro/*.css` (`declaredGrounds()`, lines 26–40) but renders plates from `/`
   ONLY (`page.goto('/')`, line 48).** Verified by reading both functions. Declaring a
   ground for a plate that lives only on `/experience` or `/how-i-build` faults rule 1
   ("no plate with that id exists") the moment it ships — v1 asserted the gate "stays
   green" without planning the change that makes that true. **Fixed:** the spec is
   amended to visit every route in `plate-height`'s `ROUTES` list (already exists,
   already the right population) and accumulate rendered plates across all of them before
   comparing. Both directions proved when built: a ground on a route the spec doesn't
   visit still faults (nothing silently exempted); a ground on a route it does visit
   passes.
2. **`.github/workflows/gates.yml`'s `build-and-test` job runs `npm run build` (line 122)
   BEFORE `npx playwright install --with-deps chromium` (line 127); the `deploy` job
   (lines 195–225) never installs Chromium at all.** Verified by reading the file
   end-to-end. Moot now the PDF is dropped — recorded so the next session doesn't
   reintroduce a build-time-Chromium step without re-checking this.
3. **`tests/nav-reach.spec.js:59-69` hardcodes `/cv` as a must-reach nav destination**
   (added deliberately per RCA-004, so a shrinking derived population doesn't go
   unnoticed). D57's target nav (`PROJECTS · EXPERIENCE · HOW I BUILD · CONTACT`) has no
   `/cv` item. **Fixed, not silently relaxed:** `/cv` stays reachable — via
   `/experience`'s "Read it on the site" link and the home act's existing "The full
   record" link — so the RCA-004 concern (a recruiter can always reach the CV) still
   holds, by a different path. The spec's literal changes from "nav's own destination set
   contains `/cv`" to "`/cv` is reachable within one click of the home page or the nav",
   crawling actual `<a>` hrefs rather than the NAV array alone. Proved both directions at
   build time: deleting every path to `/cv` reds it; the nav's own destinations no longer
   need to contain it.
4. **`src/styles/nav.css`'s `.site-nav nav a` (line 61 block) carries no
   `white-space: nowrap`** — only `.brand` (line 39) and `.chip` (line 69) do. Four longer
   labels risk a mid-label wrap in the flat-row band (901–1023px, below the 1024 point
   where labels have more room). **Fixed:** `.site-nav nav a { white-space: nowrap; }`
   added in the nav commit; the flat row's own `flex-wrap` (unaffected) still lets the
   whole row wrap to a second line under real overflow — this only stops a word breaking
   mid-label. Measured at build time across 901–1439px before considering the nav commit
   done.

**Scope and copy fixes (recruiter + manager lenses, self-verified against P-15's own
history):** the "112 skills" bare count is exactly the class P-15 was written to bar
(package 4's test-count defect, D85) — every band gets a plain-English line BEFORE any
number; `/experience`'s eras get a closing synthesis line so the page argues something
`/cv` doesn't (the arc's destination, not just its steps) and render **oldest → newest
only** (the becoming-arc direction; `/cv`'s convention is newest-first — mirroring it
defeats the page's purpose); era lines carry **zero digits**, gated (a lying figure planted
in an era line was a real, ungated hole in v1); the how-i-build trace gate anchors on
lines that follow the evidence files' own `VERIFIED —`/`REPORTED —` markers, not a
file-wide contains-check (which cannot distinguish a REPORTED cross-review claim from a
VERIFIED one in the same file); `.github` (dot-github repo) gets an honest one-liner —
checked its actual contents (`~/Projects/dot-github`): org-wide PR template, CODE_OF_CONDUCT,
SECURITY policy, semgrep config, branch-protection and repo-onboarding docs — "the
contribution and security templates every other repo inherits from", not a vague folder
name; `PROJECTS` nav item resolves to `/#systems` (D57 rules out a middle ecosystem page;
recorded explicitly, not left to be decided at the keyboard).

**Sequencing fix:** each page's own commit now carries its own `plate-height` ROUTES entry
and palette-ladder coverage (via the fix above) — not deferred to the nav commit. A height
BUDGET is set before build (not discovered at the gate), per the ordered-cuts pattern D85
already uses. **Production-check note:** `post-deploy.mjs` is deliberately asset-scoped
(hashed `/_astro/` refs from the home page only — its own header explains why), not
route-scoped; it stays that way. New routes get the same manual live verification every
package since D81 has used (direct `curl`/Playwright probe of every route after deploy),
recorded in the STATUS row, not folded into post-deploy's contract.

## Ground truth, verified by command

| Fact | Command | Result |
|---|---|---|
| Nav today | `Layout.astro` NAV array | `Systems · CV · Contact` + Email me |
| CV as a document | `cv.css:187` `@media print` | Already exists and works — the redesign's whole basis |
| DEF-37 round 8 | `docs/STATUS.md`, `tests/no-pii.mjs` | any tracked `.pdf`/`.docx` fails the gate outright, unconditionally |
| Gate floors | grep | contact `MIN_PLATES` already 9 (no bump needed, verify against rendered count); print `PLATES` 8 ids (home plates unchanged); `plate-height` `ROUTES` derives `['/', ...projects]` — new routes added per-page-commit, each with its OWN ceiling entry (not the two-bucket default) |
| Palette ladder | `palette-ladder.spec.js:26-48` | harvest-all/render-`/`-only mismatch, verified by reading; spec amendment planned, not assumed |
| nav-reach `/cv` literal | `nav-reach.spec.js:59-69` | verified; changes to a reachability check, both directions to be proved |
| nav.css nowrap | `nav.css:39,61,69` | `.site-nav nav a` has none; adding it is the fix |
| Footer on new pages | Colophon in Layout | automatic; proof-act's exact-string footer gate and colophon.spec's painted loop extend to both new routes in the SAME change (handoff's own instruction) |
| Practice evidence | `docs/evidence/practice/` | 4 files; skill-library/ci-discipline/failure-driven VERIFIED; cross-review REPORTED with its own "do not publish yet" bar — the cross-review CLAIM stays barred |
| Published skill repos | `gh repo list`, `~/Projects/dot-github` contents | `project-doc-skills` and `.github` PUBLIC, two today; three-repo threshold not met |
| Career source | `src/data/cv.js` | six employers, July 2011 – April 2026; every figure capture-bound |
| Sitemap | `astro.config.mjs:27` | `sitemap()` integration, no route filter — new pages join automatically |
| Nav baselines | git history | moved ONCE before (commit `edfaf86`, hero rewrite) — "first time" claim in prior handoffs corrected to "pixel-identical since that commit" |

## Clause maps (row IDs; every copy-governing P- row mapped or refused; the SCOPE question)

- **D57 clause 8 (/experience, overrules D32):** bird's-eye career EVOLUTION with a
  destination, not the CV restated (DEF-27 bars restating). Complete CV reachable from
  inside it via "Print or save the CV" → `/cv` (redesigned; see amendment record).
- **D57 clause 9 (/how-i-build):** the engineering model, VERIFIED practice evidence only,
  published-skills band at two repos, threshold recorded not applied.
- **D57 nav/CTA clause:** target nav and CTAs are D57's own text (`STATUS.md` row, quoted
  verbatim in "What ships" below); the ONLY-AFTER sequencing gate is the QUEUE's
  instruction (`NEXT-SESSION-PROMPT.md`), attributed there, not misattributed to D57's row.
- **P-15:** every band leads reader-first, checked HARD this round — no bare count without
  a plain-English line first; fan's recruiter lens re-asks the yardstick per band.
- **P-16/P-21:** `/experience` names employers with their cv.js-bound figures exactly as
  `/cv` does — that IS its evidentiary job, outside `#proof`'s no-name scope, which stays
  unchanged.
- **P-17:** no new status disclosures; nothing new claimed about the systems.
- **P-18:** era framing, plate composition, band ordering delegated; owner reviews renders
  at 1440/390.
- **P-19:** hero motion untouched; CTA text change must keep every motion gate green.
- **P-2/P-4/P-6/P-13:** swept — none touches these two pages.
- **D61/D62 (Lit-Surface):** `/how-i-build` carries ONE artefact panel (the
  deploy-drift-watchdog header, quoted verbatim, VERIFIED, captioned with repo+file).
  `/experience` carries none (its artefact is `/cv` itself).
- **D8:** each new page ≤250 lines; new CSS in new files; global.css untouched.
- **Palette:** two new grounds, ladder gate amended (see amendment record) to actually
  stay green rather than assumed to.
- **Voice:** VERIFIED/REPORTED-labelled only; cross-review claim barred; era lines carry
  zero digits (gated).

## What ships

**`/experience`** (`src/pages/experience.astro` + `experience.css` + `src/data/eras.js`):
- Plate 1 — the evolution: six eras from `eras.js`, importing org/dates from `cv.js`
  (never retyped), rendered **oldest → newest**. Each era: period · role context · ONE
  plain-English line on what changed, ZERO digits (gated: `/\d/` test on every era line
  fails the build). A closing synthesis sentence after the last era states what the arc
  adds up to today — the destination v1 lacked.
- Plate 2 — the record: "Print or save the CV" → `/cv` and "Read it on the site" → `/cv`
  (same target, two affordances is redundant — ONE link, labelled for its actual action).
- Height budget set BEFORE build: two plates, deep-tier ceiling (990px @ 1440, per
  `plate-height`'s existing deep-tier numbers) — six short era rows plus one closing line
  is measured against that budget before the composition is finalized, ordered cuts
  named if over (drop the closing line's second clause first, then trim an era's context
  clause) rather than discovered at the gate.
- Gates: `experience.spec.js` — eras derive from cv.js (org set equality, chronology
  strictly oldest→newest, date continuity), zero-digit bar on era text, the CV link
  resolves and appears exactly once, painted partners, `plate-height`/palette-ladder
  coverage added in this same commit.

**`/how-i-build`** (`src/pages/how-i-build.astro` + `how-i-build.css`):
- Plate 1 — the model: three bands from the VERIFIED practice files, each with a
  plain-English lead sentence BEFORE any count or term (e.g., skill-library band leads
  "An engineering practice built as reusable, versioned instructions — for requirements,
  security, testing and incident response, not only for writing code" before the 112
  count) — closing with the artefact panel (the watchdog header, verbatim, captioned).
- Plate 2 — published skills band: `project-doc-skills` (architecture-and-decisions,
  doc-critic) and `.github` (org-wide contribution and security templates), links, one
  honest line each, NO adoption claims.
- Height budget set BEFORE build: two plates against the deep-tier ceiling; the artefact
  panel's quote length is the known risk (D84's two-column act met 900px with ZERO
  slack on comparable content) — the watchdog quote is trimmed to its two load-bearing
  sentences before composition, not after a red gate.
- Gates: `how-i-build.spec.js` — every rendered claim's key term traces to a line in its
  evidence file that follows a `VERIFIED —` or `REPORTED —` marker (anchored, not
  file-wide); the cross-review phrase barred on the built page; artefact quote matches
  its evidence file verbatim; links resolve; `plate-height`/palette-ladder coverage added
  in this same commit.

**The nav step (last, same package, after both pages are green):** NAV array →
`PROJECTS (→/#systems) · EXPERIENCE · HOW I BUILD · CONTACT`; hero CTAs → `What I built ·
Career evolution · Email me`; `.site-nav nav a { white-space: nowrap; }` added;
`nav-reach.spec.js`'s `/cv` literal changed to a reachability check (both directions
proved); nav/hero baselines regenerated in CI (their first move since `edfaf86`); links
gates re-run; nav-contrast re-run at every width including the newly-measured 901–1023px
band.

**Records:** STATUS D88 (measurements, mutation ledger, fan numbers, the PDF-design
reversal recorded as a correction not a footnote) · this plan · register: D57 clauses 8/9
close; P-7 gets its progress note.

## Sequencing (one branch, ordered commits — nav strictly after both pages green)

1. eras.js + /experience + its CSS + its OWN plate-height/palette-ladder coverage + gates
   → seal → mutations.
2. /how-i-build + its CSS + its OWN plate-height/palette-ladder coverage + gates → seal →
   mutations.
3. Nav + CTAs + nowrap fix + nav-reach reachability change + baseline regeneration → seal
   → mutations.
4. Records; built fan on the whole; R-7 Codex on every new/changed spec (full output
   captured to a FILE, never piped through `tail`); round-2 on fixes; PR; W-24 merge;
   deploy watch; live verify (including a manual probe of both new routes, per the
   post-deploy scope note above).

## Not in this package

Home plates, the act, project pages, `/cv` content (linked to, never edited) · any
build-time PDF (redesigned away — see amendment record) · the three-repo threshold act ·
I-3 and the rest of the register queue.
