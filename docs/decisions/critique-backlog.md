# The critique backlog — one decision record per rule

The `impeccable` detector reports **25 pre-existing findings** on this site (D131 filed them as
candidates, not defects, and did not act on them). This file is the record the standing queue
asked for: **one decision per rule, reached by checking the finding rather than by trusting it.**

Measured on the `ec6c881` build, 2026-08-27, with
`node .claude/skills/impeccable/scripts/detect.mjs --json dist`.

| Rule | Count | Decision | Whose |
|---|---|---|---|
| Flat type hierarchy | 7 | **Refuted — engine artefact. Closed, no change.** | Mine |
| Font outside DESIGN.md | 1 | **Real, and it is a documentation lag. Fix: one front-matter line.** | Mine |
| Colour outside DESIGN.md | 9 | **Split. 8 are documentation lag; 1 is a genuine hard-coded leak.** | Mine |
| Em-dash overuse | 8 | **Real counts. It is a voice call, so it is his.** | **Owner** |

One correction to D131 in passing: it summarises the nine colour findings as "the `--surface` /
`--lit` value-ladder steps DESIGN.md names in prose but not in its front-matter." That is true of
eight of them. The ninth, `#7a2318`, is a chip colour hard-coded in `hero-practice.css` and is
not a value-ladder step, not a token, and not in `DESIGN.md` at all. Checked, not inherited.

---

## Record 1 — Flat type hierarchy (7 findings): REFUTED, closed

**What it claims.** *"Font sizes are too close together — no clear visual hierarchy."* It reports
ratios of **1.2:1 to 1.5:1**, listing sizes like `11px, 12.5px, 13.4px, 16px`.

**Why it is wrong.** The detector is a static engine. It cannot resolve `clamp()`, and every
display and headline size on this site is a clamp — `clamp(3rem, 6.8vw, 6rem)` for display. So it
sees only the small end of the scale and reports the ratio of the small end to itself.

**Measured in a real browser**, every visible text-owning element, computed font size:

| Route | 1440×900 | 390×844 |
|---|---|---|
| `/` | 22 sizes, 11px → **92.8px**, ratio **8.4:1** | 20 sizes, 11px → 44.8px, **4.1:1** |
| `/projects/citevyn` | 11 sizes, 11px → 59px, **5.4:1** | 11 sizes, 11px → 35.2px, **3.2:1** |
| `/experience` | 9 sizes, 11px → 59px, **5.4:1** | 9 sizes, 11px → 35.2px, **3.2:1** |

The detector reports 1.5:1 where the page renders **8.4:1**. The finding is an artefact of the
same class D131 already identified and refuted for the eight `rgb(0, 0, 0)` skip-link
findings — the static engine reading a default because it cannot compute the real value.

**Decision: closed, no change to the site.** Recorded here so it is not re-raised next month.
The general lesson is the one this repo already has: *when the claim is visual, LOOK* (trap 9).

---

## Record 2 — Font outside DESIGN.md (1 finding): real, fix the document

**The finding.** `Bodoni Fallback`, in the built `Layout` CSS.

**It is not a rogue font.** `DESIGN.md` line 204 describes it in prose: *"`Bodoni Fallback`, a
metric-tuned face"*. It is declared in `src/styles/global.css:15` and used at `:24` as the second
step of `--serif`. Its whole job is to hold the metrics while the variable Bodoni loads.

**So the defect is in the document, not the CSS.** `DESIGN.md`'s front-matter is the
machine-readable half that the detector reads; its prose is the half a human reads. The two
disagree, and the detector is right that they disagree.

**Decision: add `Bodoni Fallback` to the `typography` front-matter as an explicit fallback,
recording what the prose already says.** Not a design change — the shipped pixels do not move.
Its own package.

---

## Record 3 — Colour outside DESIGN.md (9 findings): split, because they are not one thing

Traced to source rather than counted:

**(a) Eight are documentation lag — the front-matter never caught up with `palette.css`.**
`DESIGN.md` front-matter lists six ground/surface pairs. `src/styles/palette.css` declares ten.
The extra families arrived with later packages, each with its own contrast measurement written
into the CSS beside it, and none reached the front-matter:

| Flagged | Where | What it is |
|---|---|---|
| `#413718` | `palette.css:64` | a `--surface` step |
| `#1d0d23` · `#351b3f` | `palette.css:77,78` | the aubergine ground/surface pair |
| `#12230e` · `#214019` | `palette.css:91,92` | a green ground/surface pair |
| `#402b19` | `palette.css:97` | an umber `--surface` step |
| `#f7f4ec` | `palette.css:144` | the `--lit` step on the paper theme |

**Decision: real, and the fix is to the document.** Same shape as Record 2: the front-matter is
behind the CSS. Adding them changes no pixels. Its own package.

**(b) One is a genuine leak.** `#7a2318` appears only in `src/styles/hero-practice.css:72`,
hard-coded **three times in one line** — as a `color-mix` input, a `color`, and a `border`. It is
not a token, it is not in `palette.css`, and it is not in `DESIGN.md` in any form.

**Decision: real, and the fix is to the CSS** — give it a token and name it in `DESIGN.md`, or
replace it with an existing one. **The colour it renders is a claim about the design system**, so
which of those two applies is a presentation call. Its own package.

---

## Record 4 — Em-dash overuse (8 findings): real, and it is the owner's call

**The counts are real body-copy counts, not artefacts:**

| Page | Em-dashes in body text |
|---|---|
| `/` | **40** |
| `/cv` | **34** |
| `/experience` · `/projects/narratwin` · `/projects/quorum` | 11 |
| `/how-i-build` · `/projects/saafsaans` | 10 |
| `/projects/citevyn` | 9 |

**Why it is not mine to decide.** This is the site's copy. `AGENTS.md`'s voice section is the
owner's, and P-18 reserves anything that changes a fact, a claim, or how he is described in a
public document. Rewriting 40 sentences on the home page is a voice change, not a fix.

**The ask, and my recommendation, are carried to him in the handoff.** The detector's own words
are *"Advisory only: humans use em-dashes legitimately"*, and this repo's own rule is that a
reviewer's severity label is evidence to investigate, not authority. Nothing changes until he
answers.

---

## What this file is not

It is not a fix. Per the standing queue: *"Fix only what the record says to fix, each as its own
package."* Records 2 and 3 name work that is mine and not yet done; Record 4 names a question
that is his. Record 1 is closed here and needs nothing.
