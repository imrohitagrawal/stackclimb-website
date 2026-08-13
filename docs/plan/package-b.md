# Package B — the remedial PR, planned clause by clause

Implements the three defects the owner found on the live site after package 3, as recorded in
D79 and the agreed plan (`~/.claude/plans/1-after-the-first-linear-pearl.md`, Sequence item B).
Per the D79 process rule, every clause of every recorded decision this plan implements is
quoted **by line number** and mapped to a **named acceptance test** or a **written refusal**.
No summaries were used as input: rows D57 (`docs/STATUS.md:53`), D60 (`docs/STATUS.md:32`),
D61 (`docs/STATUS.md:33`) and D79 (`docs/STATUS.md:34`) were opened and read whole.

**NO RESTRUCTURE.** The full home-page rewrite was reviewed by eight lenses and rejected on
measurement (D79). Re-verified in this session before planning: `palette-ladder.spec.js:46`
requires >3 declared `#id{--ground}` rules each landing on a `.plate[id]` on `/`, with
rendered distinct ≥ declared + 1; `plate-height.spec.js:86` requires >4 plates on `/`.
Together: a five-plate floor. This package **adds** a plate and a ground; it weakens nothing.

## The clause map

### D57 (`docs/STATUS.md:53`)

| # | Clause, quoted | Disposition |
|---|---|---|
| 1 | *"home is the argument, subpages are the evidence"* | Test `overview.spec.js: the overview is an index, not a second copy of the cards` — `#overview` contains no `.record`, and each system row carries at most one figure |
| 2 | *"Nav → `PROJECTS · EXPERIENCE · HOW I BUILD · CONTACT`"* | **REFUSED for this package.** `/experience` and `/how-i-build` are 404 until package 5, and a nav must not name a 404. Nav stays `Systems`. Recorded in D79's remedial spec and re-stated here |
| 3 | *"Grouping: two groups… **Use them now** / **Being built**, under 'What you can use, and what is still being built'"* | Test `overview.spec.js: two groups, named as D57 records them` — exactly these two group labels, under that heading |
| 4 | *"Card model: signature proof first… then Works now / In development / Not claimed, then links"* | **REFUSED for the overview plate**, with the refusal D79's remedial spec itself wrote: *"Compact rows: name, state, one line, one figure, link out. NO record columns — this is an index, not a second copy of the cards."* The card model lives on the system plates and project pages, which already lead with the proof |
| 5 | *"Project depth: two levels — each project becomes `/projects/<name>`"* | Shipped in D76. B3 amends plate 1 of those pages; routes unchanged. Guarded by existing `plate-height.spec.js` route floor |
| 6 | *"Published AI skills are a band on `/how-i-build`"* | **REFUSED for this package** — that page is package 5 |
| 7 | Acts: *"00 hero · 01 professional proof (two ledgers) · 02 what I built…"* | The overview opens act 02: placed after `#top`, before `#systems`. Act 01 (two ledgers) is package 4; the slot between hero and overview stays open. Test `overview.spec.js: the overview sits between the hero and the four system plates` |

### D60 (`docs/STATUS.md:32`)

| # | Clause, quoted | Disposition |
|---|---|---|
| 1 | *"the `Being built` group is ordered **Aegis → EvalAxis → NarraTwin**, so the band closes on NarraTwin's No-Go"* | Test `overview.spec.js: Being built closes on the No-Go` — asserts that exact order |
| 2 | *"a cold reader can otherwise read it [StackClimb] as a former employer"* — definition placement | Out of scope: D60 ties the definition to the two-ledger act (package 4) and the footer, neither touched here |

### D61 (`docs/STATUS.md:33`)

| # | Clause, quoted | Disposition |
|---|---|---|
| 1 | *"a system with no artefact yet gets no panel, never a placeholder"* | The overview rows carry no panels at all (index, not cards). Applied by extension to figures: **Aegis gets no figure** — nothing is built, and inventing one violates the voice rule. EvalAxis's figure comes from `docs/evidence/projects/private.md:19-26` (VERIFIED, audited at `c3233de`): 13,769 lines · 388 test functions |

### D79's remedial spec (B1–B3), and the agreed plan (`1-after-the-first-linear-pearl.md:109-111`)

| # | Clause | Disposition |
|---|---|---|
| B1a | *"Restore the six-system overview AS ITS OWN PLATE — not as a replacement for the project plates"* | New `#overview` plate; the four system plates, `#private`, `#contact` untouched. Home goes 7 → 8 plates |
| B1b | *"It must carry its own `--ground` so the palette ladder gains a plate rather than losing one"* | New `#overview` rule in `palette.css` (dark olive — a hue no neighbour uses), declared grounds 5 → 6. Gate: existing `palette-ladder.spec.js`, which now checks the new plate automatically |
| B1c | *"Compact rows: name, state, one line, one figure, link out"* | Row = name · state · the system's question · one strip figure · link. The four public systems link to `/projects/<slug>` — the depth D57 clause 5 built. EvalAxis and Aegis get **no link**: `[slug].astro`'s own precedent — an absent link is correct where a disabled one implies the thing exists |
| B2 | *"`global.css:189` scopes the arrow to `a[target='_blank']`, so `The system` renders as plain text in a row of arrowed links. Give internal navigation its own mark, distinct from the external one"* | Internal links in `.links` get a right-arrow mark (mask, like the external diagonal but pointing in). Test `link-affordance.spec.js: internal and external links carry different visible marks` — computed `::after` of both, asserts both non-empty and different |
| B3a | *"the click currently LOSES the Gate line and the Not claimed row… Give plate 1 those two elements"* | `[slug].astro` plate 1 gains `sys-gate` and the `Not claimed` row. Test `project-plate1.spec.js: plate 1 carries the Gate line and Not claimed` |
| B3b | *"Project-page plate 1 stops duplicating the home plate. Measured: 7 sentences appear on both"* | Plate 1 drops the two elements it repeats verbatim from the home plate — `body[0]` and the proof line — and renders `body.slice(1)` plus the elements home defers. Test `project-plate1.spec.js: no sentence from the home plate is repeated on plate 1` (DEF-27's class, finally gated) |
| B3c | *"move the record up so the click lands on new material"* | **Interpreted, and the interpretation is stated rather than silent:** the record's two signature elements (Gate, Not claimed) move up into plate 1, and the duplicated sentences leave it, so the first screen after the click is new material. The record plate itself stays second: merging it into plate 1 was measured at 1,082px against the 900px viewport before (D76), and DESIGN.md:228 says content that cannot fit becomes another plate. If the owner meant the record plate becomes plate 1, that is a one-line reorder and is flagged for his review in the PR |

## What ships

- `src/components/OverviewPlate.astro` (new) + `src/data/overview.js` (new) — the index rows,
  sourced from `projects.js` states/strips and `private.md` evidence; no new claims
- `src/styles/overview.css` (new, scoped) · `palette.css` gains `#overview`
- `global.css` internal-link mark beside the existing `:189` external rule
- `src/pages/projects/[slug].astro` — B3 changes
- Tests: `overview.spec.js`, `link-affordance.spec.js`, `project-plate1.spec.js` — each
  mutation-proved (the mutation named in the file header, watched red, restored)
- Visual baselines regenerated **in CI only** (`-f update_visual_baselines=true`), `-linux`
  files committed unchanged. Expected signature: plate baselines move, nav baselines do not
- `docs/STATUS.md` row D80 in the same PR

## Definition of Done, applied

Build clean · seen rendering at 1440, 1024, 390 · every claim traces to `docs/evidence/`
(EvalAxis figure: `private.md:19-26`) · focus visible, AA contrast on the new plate ·
no horizontal scroll at 390 · **no deploy** — the owner deploys by hand.

## Amendments — the seven-lens fan (round 1) and the owner's answers, 2026-08-14

The fan raised 38 findings across 7 lenses; the adopted set below. Refuted: "Being built
closing on the No-Go reads as weakness" — the recruiter lens itself concluded it reads as
disclosure and the group closes on its strongest-evidenced row.

1. **B3a/B3b contradiction (HIGH, 5 lenses).** The no-duplication test compares **body
   paragraphs and the proof line only**. The question, Gate line, Not claimed row, title and
   caption strip are deliberate cross-surface anchors — B3a itself adds two of them. Mutation
   that turns it red: restore the proof line (or a home-shown body paragraph) to plate 1.
2. **body.slice(1) empty for CiteVyn and Quorum (HIGH, verified by execution).** Owner's
   decision: a principal-architect lens and an AI-architect lens run per repo, verify by
   command, and their strongest finding becomes the new second body paragraph — landed in this
   PR for CiteVyn and Quorum, with `docs/evidence/` updated in the same commit. The full
   six-system sweep is package C. Plate 1 renders `body.slice(1)`; `body[0]` stays home-only;
   the meta description still derives from `body[0]` in data.
3. **Overview placement (MEDIUM, 3 lenses).** The overview plate is the **first child inside
   `<section id="systems">`**, so the nav `Systems` and the hero CTA `What I built` land on the
   index instead of scrolling past it. DEF-34 does not reapply: a plural label lands on an
   index of six. Nav word unchanged.
4. **Row line (owner, 2026-08-14).** One plain-English line per row that doubles as the
   relatable example for a non-technical reader — behaviour they can picture, no jargon, no
   new claims, and NOT the question verbatim (which would render six sentences twice on `/`).
5. **Data derives, never restates.** `overview.js` imports `projects.js` and maps
   name/state/figure; the EvalAxis and Aegis entries (question, one-liner, state) move to a
   shared module that the `#private` cards also read — one source, two consumers.
6. **Height budget, before CSS.** At 390×844 the plate has ~1,270px of content budget under
   the 1.75 ceiling: heading + two group labels ≤ 340px, six rows average ≤ 150px. Measured
   in the DOM before the gate runs, D76-style; if it does not fit, the figure is what gives
   way at 390, never the state.
7. **Gate files the plan missed:** `contact.spec.js` MIN_PLATES 7 → 8 (its own header:
   "BUMP THIS in the same change that adds a plate"); `print.spec.js` PLATES gains
   `overview`; `index.astro` sits at its frozen 260-line shrink-only ceiling, so the stale
   "#overview is gone" comment (index.astro:139-155) is rewritten shorter to fund the two
   added lines.
8. **link-affordance test respecified.** Assert `mask-image` (and `-webkit-mask-image`) is
   non-none on both marks and different between them, plus each ::after box has non-zero
   rendered width/height and painted background — declaration alone proves nothing. The
   internal mark is a **chevron**, not a rotated external arrow — at 7px rendered, rotation
   alone is indistinguishable. Test samples both anchors from the same `.links` row AND one
   overview row link.
9. **overview.spec partner assertions.** Exactly 6 rows, each `toBeVisible()` (not
   `count()`); labels matched with `exact: true` scoped inside `#overview` ("Being built"
   substring-matches the #private plate's prose otherwise); heading levels pinned: plate
   heading h2, group labels h3, row names not headings.
10. **project-plate1.spec locators scoped** to the first plate (`#<slug> .sys-gate`,
    `#<slug> .sys-nc`), `toBeVisible()`, all four slugs — an unscoped `Not claimed` matches
    the record plate and passes with no change.
11. **In-page duplication, decided:** plate 1's Not claimed row AND the record's Not claimed
    column both stay — landing summary vs comparison table — recorded in D80.
12. **B3c (owner, 2026-08-14):** elements up, record stays plate 2, as recommended.
13. **Zero-slack notes for D80:** the palette ladder passes with rendered = required exactly;
    package 4's act plate must declare its own novel ground. The olive must differ from all
    five declared grounds and the navy default, and `--ground` for `#overview` lives ONLY in
    `palette.css` (the ladder's regex harvests every `#id{--ground}` in built CSS).

## Known tension, stated

The hero strip reads `Systems built 4 of 6` while NarraTwin sits in *Being built*. Both are
recorded decisions (D74's count; D57/D60's grouping). The row's state cell —
`Phase 1 — No-Go · not deployed` — carries the reconciliation: built, and not usable yet.
Not resolved here; flagged so it is a decision, not drift.
