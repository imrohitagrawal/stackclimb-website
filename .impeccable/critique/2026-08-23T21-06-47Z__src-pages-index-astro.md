---
target: src/pages/index.astro (home page)
total_score: 24
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-23T21-06-47Z
slug: src-pages-index-astro
---
Method: dual-agent (A: general-purpose subagent ac00dd0883706dced · B: general-purpose subagent a4e17e858c542e4f8)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | State chips (LIVE/NO-GO/etc.) are honest and clear; the hero's auto-replaying practice widget gives no cue for why it's animating before the visitor has read anything |
| 2 | Match System / Real World | 4 | Tailor's-ticket LABEL/VALUE metaphor is coherent and plain-language throughout |
| 3 | User Control and Freedom | 3 | Nav works everywhere; no "back to top" or section progress on a 7+ full-viewport-plate page |
| 4 | Consistency and Standards | 3 | Plate grammar repeats faithfully across all six systems; but the same 6-system list is phrased three different ways in one scroll |
| 5 | Error Prevention | 3 | No forms to fail; external links correctly use `rel="noopener"` |
| 6 | Recognition Rather Than Recall | 3 | Plate hue-per-system aids orientation; no indicator of how many plates remain or section boundaries |
| 7 | Flexibility and Efficiency | n/a | One-time cold-visit landing page; no power-user path expected |
| 8 | Aesthetic and Minimalist Design | 3 | Restrained system (one accent, no shadows) undercut by two redundant index passes over the same six systems before any detail |
| 9 | Error Recovery | 2 | Artefact panel images can render broken (no fallback) under a reproduced fast-scroll lazy-load race — no other error states exist to test |
| 10 | Help and Documentation | n/a | Not applicable to a static single-purpose landing page |
| **Total** | | **24/32** | **Good (75%)** |

## Design Specificity Verdict

**LLM assessment (Assessment A):** Authored for this product, not template-swappable. The caption-strip vocabulary ("ENFORCED," "BLOCKING," "NOT CLAIMED"), the six ochre stat tiles counting the site's own practices, the "Two ledgers, deliberately kept apart" plate structurally separating self-reported from inspectable evidence, and per-system "NOT CLAIMED" rows are specific claims about specific systems — a generic template has never shipped a caption cell whose job is to state what the builder refuses to claim.

**Deterministic scan (Assessment B):** `detect.mjs` against the built `dist/index.html` (the `.astro` source only supports weak regex matching, not real analysis) returned 2 findings: a `flat-type-hierarchy` warning (four sizes clustered 10.6–14.7px, ratio 1.4:1) and an advisory `em-dash-overuse` flag (40 em-dashes in body copy). Neither is a specificity problem — both are about the label-tier type scale and the writing register, which is intentional per DESIGN.md's own documented small-caps label sizes. Flagging the em-dash count as worth a second look anyway: the detector calls dense em-dash use an "AI cadence tell," which is an uncomfortable coincidence for a site whose whole thesis is "we don't fake it" — worth a human read-through even though it's advisory-only and likely just this writer's actual house style (confirmed elsewhere in this repo's own docs).

**Browser overlay findings, not caught by the design read:** `window.impeccableScan()` on the live-rendered page found 96 objective findings the holistic review missed because they read as "intentional small-caps labels," not defects: 70 instances of `undersized-ui-text` (9.44–10.56px) and 16 of `tiny-text` (11–11.2px) — hitting exactly the caption-strip/gate-label register (project name chips, "Checking"/"Enforced"/"Blocking," stat labels) that carries most of the page's factual content. This is a genuine disagreement between the two assessments worth surfacing: Assessment A called the type hierarchy "disciplined," Assessment B's pixel measurements say a large share of the functional label text sits below common minimum-legible-text thresholds. Both are correct on their own terms — the scale is *coherent*, but coherent doesn't mean *readable*.

## Overall Impression

The page's central move — showing, not just claiming, that the builder doesn't overclaim — genuinely lands, and the "Two ledgers, deliberately kept apart" plate is real craft. The two things holding it back from Excellent are structural, not aesthetic: it makes a 90-second-skim visitor read the same six project names three times before reaching substance, and a meaningful share of its signature caption-strip text is small enough to strain reading on the exact register that carries the site's proof.

## What's Working

- **"Two ledgers, deliberately kept apart."** Turns an abstract positioning claim into a literal, one-glance layout decision — the strongest single moment on the page.
- **Honest state chips.** "PHASE 1 — NO-GO" renders in the same slot, same weight, as "LIVE," with no apology. Rare on a portfolio site, and exactly what the product brief asked for.
- **Lit-surface artefact panels, when they load.** Real dated screenshots with committed hashes create genuine evidentiary pop against six dark painted grounds — most convincing thing on the page.

## Priority Issues

**[P1] Undersized functional text across the caption-strip/label register** — 70 elements measured 9.44–10.56px, another 16 at 11–11.2px (detector-verified on the live render, not opinion).
**Why it matters:** this is the register carrying the page's core factual content — project names, gate states ("Checking"/"Enforced"/"Blocking"), stat labels — on exactly the audience (cold arrival, skimming, often mobile) least likely to zoom in and re-read.
**Fix:** raise the label-tier floor (DESIGN.md's `caption-label`/`swatch`/`ledger-term` steps currently sit at 9.6–10.24px) toward an 11–12px floor for anything carrying a fact rather than pure ornament; keep the tracked-caps treatment, just larger.
**Suggested command:** `/impeccable typeset`

**[P1] Artefact panel images can render broken under a fast mobile scroll** — reproduced directly: `naturalWidth/Height: 0` with `complete: true` after a rapid scroll jump on a 390px viewport, caused by a native lazy-load race, not a missing/corrupt asset (forcing `loading="eager"` fixed it instantly).
**Why it matters:** this is the exact panel DESIGN.md's own Lit-Surface Rule calls the load-bearing evidence — "a page that promises 'AI that shows its work' cannot show a wireframe where the work belongs" — and the visitor most likely to trigger it (fast one-handed phone scroll) is the persona this page explicitly designs for.
**Fix:** set `loading="eager"`/`fetchpriority="high"` on the first artefact panel per system plate, since under the One-Plate-One-Viewport rule these are effectively above-the-fold for their own section.
**Suggested command:** `/impeccable harden`

**[P2] The same six systems are indexed three separate times in one continuous scroll** — ProofPlate's mini-table, then OverviewPlate's fuller index, then six detail plates, each with its own slightly different one-line description of the same product.
**Why it matters:** PRODUCT.md's own audience is a 90-second cold skim; making that visitor reconcile three phrasings of one fact before reaching anything new spends the attention budget the whole site is built to conserve.
**Fix:** collapse to one index pass — fold ProofPlate's per-row taglines into prose ("six independent systems, detailed below") or merge it into the OverviewPlate index rather than repeating all six names twice before the details.
**Suggested command:** `/impeccable distill`

**[P2] The hero bundles nine distinct content types before the first decision point** — headline, avatar, lede, 3-item CTA row, 5-row ledger, thesis line, an auto-replaying 6-item practice strip, and a 4-cell stat strip.
**Why it matters:** a cold arrival has to choose between reading the ledger, watching the animation, or clicking a CTA all at once — the plate doesn't sequence attention, it offers everything simultaneously, and the stat strip in particular ("Practices, enforced — 6") lands as unreferenced numbers before a single named project.
**Fix:** move the practice-replay strip and stat cells one plate later — they're a condensed preview of ProofPlate, which already exists — and let the hero resolve to headline + one clear CTA.
**Suggested command:** `/impeccable layout`

**[P3] The hero's practice-replay widget autoplays with no visible pause control or affordance explaining the motion, and reduced-motion behavior is unverified.**
**Why it matters:** it's the only autoplaying element on an otherwise still page; without a cue, a first-time visitor may read the state-cycling as a loading glitch rather than intentional "practice the thesis" theater.
**Fix:** add a one-word micro-label ("replaying") or visible play/pause, and confirm `prefers-reduced-motion` suppresses the autoplay cycle.
**Suggested command:** `/impeccable polish`

## Persona Red Flags

**Jordan (confused first-timer, cold, ~90 seconds):**
- Meets a 6-item stat strip ("Practices, enforced — 6") before meeting a single named system — the numbers have no referent yet.
- Reads three different one-line descriptions of CiteVyn within one scroll with no signal these are the same fact restated.
- The nav's "PROJECTS" label doesn't literally match the section it points to ("What you can use, and what is still being built") — a small inference tax.

**Casey (distracted mobile user, one-handed, low patience):**
- Is exactly the visitor most likely to trigger the broken lazy-loaded artefact image — a fast one-handed scroll-flick is the reproduced trigger condition.
- Faces roughly 2–3 phone screens per system across six systems plus two private-work cards and a contact plate — a long one-handed scroll before "One message away."
- The mobile nav menu itself opens/closes cleanly and links resolve correctly — verified working, not a flag (worth noting given this repo's own history of a broken mobile nav, DEF-42).

## Minor Observations

- Square-cut shapes and the single-accent (ochre) rule are followed with no drift found in either assessment.
- Keyboard focus ring on nav links is a clean visible ochre outline.
- `/experience` and `/cv`, both linked from the hero/contact plate, resolve live — "no dead ends" holds under an actual check, not just the claim.
- The em-dash count differs slightly between the static-HTML detector (40) and the live-DOM scan (39) — a one-dash discrepancy from extraction method, not investigated further, noted for completeness.
- No horizontal overflow found at either width Assessment B could verify (1470px and 800px — see caveat below); true 390px could not be confirmed due to a viewport-resize tool limitation in that session, reported rather than assumed.

## Questions to Consider

1. If "Two ledgers, deliberately kept apart" is the strongest moment on the page, why does it arrive second, under a hero already doing five other things — what would it feel like if that idea led, and the hero compressed to headline + one CTA?
2. Every system plate ends with a "NOT CLAIMED" row. Would the same honesty land harder if one such line sat in the hero itself, before any project is named — so the first thing the page volunteers is a limit, not a metric?
3. Does the page let a recruiter *verify* a claim in fewer clicks than it takes to *read* three restatements of the same tagline — and if not, is the ledger structure actually more convincing than the reading is?
