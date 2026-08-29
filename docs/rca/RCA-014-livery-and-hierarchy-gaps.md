# RCA-014 — three plates carry no ground, ochre means six things on `/cv`, and one emphasis span is invisible

**Status: written before the fix, per AGENTS.md's order, on 2026-08-29.**

D153 (the three-page critique) flagged this as P4 ("livery and hierarchy"). Reproduced fresh from
a clean `main` (`ccdbd46`), independent of the critique's own numbers, per AGENTS.md's "execution
is the source of truth." One number below (the type-hierarchy measurement) does not exactly match
D153's stated "7 of 8" — reported as measured, with the discrepancy noted rather than forced to
match.

## What happened

Four independent defects, all under the same "the palette and type system are under-applied"
heading:

1. **Three plates render on the un-hued base ground**, not a plate-specific one.
   `src/styles/palette.css` declares a per-plate `--ground` for `#overview`, `#proof`,
   `#evolution`, `#how-i-build`, `#citevyn`, `#quorum`, `#saafsaans`, `#narratwin`, `#private` — but
   three real plate IDs used in markup have no matching rule: `#evolution-record`
   (`/experience`'s second plate), `#evals-observability` and `#published-skills` (`/how-i-build`'s
   second and third plates). All three fall back to `.plate`'s base `--ground: #0e1322`. The latter
   two are adjacent on the same page and render the identical hex value — a visitor scrolling
   `/how-i-build` sees zero color change across two consecutive plates.
2. **Ochre carries six unrelated jobs on `/cv`, at 36 elements**, and one of the six is
   indistinguishable from a real link. A live computed-style census (every element whose
   `color` equals `--ochre`'s rgb) found: the job title (1), real anchor links — email, LinkedIn,
   GitHub, project links (11), section headings (6), **employer names — Oracle, Amazon, LimeRoad,
   Mobileum, etc. (6)**, project state labels (6), and gate-key labels (5). The employer-name group
   is not wrapped in an `<a>` and goes nowhere, but shares the exact color, and (checked) similar
   weight/underline treatment as the 11 real links two categories over — a recruiter skimming the
   page has no visual cue that six of the "linky-looking" ochre spans do nothing.
3. **One emphasis span is real but imperceptible.** `/how-i-build`'s third `model-band` wraps
   `.band-term` ("the incident that caused it") inside `.band-lead`, which sets its own
   `font-weight: 600`. `.band-term` sets `font-weight: 700` — a 100-unit jump. Every other
   `.band-term` on the page sits inside `.band-support`, which sets no `font-weight` at all
   (inherits the body's 400) — a 300-unit jump to the same 700. The font (`Archivo Variable`,
   confirmed genuinely self-hosted and loaded as a true variable font, weight axis 100–900 — not a
   phantom/fallback font, checked and ruled out as a cause) can render both jumps distinctly; the
   100-unit one is real but too small to read as emphasis next to text that is already
   semi-bold.
4. **The type scale reads flatter than it is.** On `/cv`, a live census of every leaf element's
   `font-size` found 11 distinct values; **7 of them sit within a 3.2px band (11.52px–14.72px)** —
   close to, but not an exact match for, D153's "7 of 8 rendered sizes sit inside 11–16px" (this
   RCA's own standard is a fresh count, not a copied one; the shape of the finding — most of the
   scale crowded into one narrow band while two or three sizes carry all the visual weight — is the
   same). `/experience` and `/how-i-build` show a milder version of the same pattern (4 of 6
   distinct sizes each sit within a similarly narrow band).

## The measurement

Reproduced fresh, `npm run build` + `astro preview` on `http://localhost:4321`, Playwright:

```
=== Ground fallback (grep-verified against palette.css, then confirmed live) ===
Declared IDs: (base), #overview, #proof, #evolution, #how-i-build, #citevyn, #quorum,
              #saafsaans, #narratwin, #private
Plate IDs in markup with NO matching rule: #evolution-record, #evals-observability,
              #published-skills   <- all three fall back to base #0e1322
              (evals-observability and published-skills are adjacent, /how-i-build plates 2 and 3)

=== Ochre census, live computed style (getComputedStyle(el).color === 'rgb(201, 155, 63)') ===
total: 36 elements, six categories:
  P.cv-title            1   (job title)
  A (various)           11  (real links: email, LinkedIn, GitHub, project links)
  H2                     6  (section headings)
  SPAN.org               6  (employer names — Oracle, Amazon, LimeRoad, Mobileum, ...) <- not links
  SPAN.cv-state           6  (project state labels — Live, etc.)
  SPAN.cv-gate-k         5  (gate-key labels)

=== band-term/band-lead weight, live computed style ===
Band 1 (band-support, no term)      lead 600
Band 2 (band-support, no term)      lead 600
Band 3 (band-LEAD carries the term) lead 600, term 700   <- 100-unit jump, the invisible one
Band 4 (band-support, has term)     (support: inherits 400), term 700
Band 5 (band-support, has term)     (support: inherits 400), term 700
Screenshot of band 3, cropped: "the incident that caused it" reads as the SAME weight as the
surrounding sentence to the eye, confirming the computed-style gap does not translate to a
visible one.

=== Archivo Variable — confirmed real, ruled out as a red herring ===
document.fonts.check('600 16px "Archivo Variable"')  -> true
document.fonts list includes "Archivo Variable 100 900 (loaded)"
built CSS confirms self-hosted @font-face, format("woff2-variations"), weight range 100 900
   (an initial hypothesis that the declared font never loads and silently collapses to a
   Helvetica/Arial 400/700-only fallback was tested and REFUTED here — recorded so the next
   reader doesn't re-test the same wrong theory)

=== Type-scale census, live computed style, leaf elements only ===
/cv:          11.52, 11.84, 12.16, 12.48, 12.8, 13.44, 14.72, 17, 18.24, 22.4, 77.76 (px)
              -> 7 of 11 sizes inside an 11.52-14.72px band
/experience:  12.48, 13.76, 15.04, 16, 17, 59.04 (px) -> 4 of 6 inside 12.48-16px
/how-i-build: 11.2, 12.48, 14.72, 16, 17, 59.04 (px)  -> 4 of 6 inside 11.2-16px
```

## Why nothing caught it

None of these are things a functional test can catch without a specific, hand-written assertion —
there is no gate anywhere in this repo that checks "does every plate ID have a declared ground,"
"does every ochre-colored element serve one job," or "is this emphasis span visually distinct."
`tests/dod.spec.js`'s accessibility pass (axe-core) checks contrast ratios, not perceptual
distinctiveness between two in-range colors or two in-range font weights — both the invisible
band-term and the employer-name/link confusion pass every contrast check because nothing about
either is a contrast failure; the problem is redundancy of meaning, which axe does not model.
D153's own critique found all of this by literally counting: computed-style census scripts, not
visual inspection alone (a plain screenshot would not obviously reveal "these two elements are
the same hex" without checking).

## Where it was introduced

The per-plate ground map in `palette.css` was built against the ORIGINAL set of plates the home
page and project pages carried; `/experience` and `/how-i-build` picked up multi-plate structure
later (`evolution-record` on `/experience`, and `evals-observability`/`published-skills` as
`/how-i-build` grew from one plate to three) without anyone extending the ground map to match —
the same class of gap as P3's dead classes, a different file. Ochre's six roles on `/cv`
accumulated incrementally: the color was the site's one accent from the start, and successive
features (state labels, gate-key labels, employer names) each reached for "the accent color" as
the path of least resistance rather than checking what it already meant. The band-term/band-lead
weight gap is a direct side effect of which parent element P-7's evals-observability plate authors
happened to nest the term in — four of five instances used `.band-support`, one used `.band-lead`,
and nobody compared the two parents' base weights before shipping. The type scale flattened
gradually as the same `clamp()`-driven responsive sizes were reused across unrelated copy blocks
that never needed to differ, rather than a single decision to flatten it.

## Where it was caught

Not by any gate. By D153's critique, running computed-style censuses rather than eyeballing
screenshots — and by this RCA's independent reproduction, which additionally ruled out a real but
wrong hypothesis (the phantom-font theory for item 3) before writing the fix.

## Cost

A visitor scrolling `/how-i-build` crosses two consecutive plates with the identical ground —
the site's own "value ladder" device (a deliberate palette per system) silently stops working for
two of its five entries. A recruiter treating six ochre employer names as clickable evidence links
finds nothing when they click — the opposite of the site's stated goal of make every claim
checkable. The single most load-bearing line on the evals-observability plate — the sentence
naming the incident a tool was built from — carries no visual signal that it is the important
part. And a type scale that reads as one size undersells a site whose whole subject is disciplined,
inspectable systems.

## The fix

1. **`palette.css`**: add `#evolution-record`, `#evals-observability`, `#published-skills` rules,
   each a genuinely distinct hue from its neighbors on the same page (not reused from another
   page's plate) and meeting the same contrast floor the existing rules were measured against
   (bone/ochre readability, checked in the existing rules' own comments — follow that pattern, not
   a new one).
2. **`/cv`**: reduce ochre's roles. Candidates, decided during implementation with the least
   invasive option preferred: employer names (`SPAN.org`) are the one that must change — they are
   not links and must stop looking like the 11 that are (either a different, non-link-adjacent
   color/weight treatment, or — if they should genuinely be links to something, e.g. the
   employer's own site or the relevant `/projects/<slug>` — make them real `<a>` elements, which
   is a bigger, separately-justified decision). State labels and gate-key labels can plausibly
   keep ochre if they're visually distinct from real links in some other way (weight, no
   underline) — verify against the fixed employer-name treatment, not assumed.
3. **`how-i-build.css`**: give the third `model-band`'s `.band-term` the same effective contrast
   as the other four — either move it into a `.band-support`-shaped context, or raise its own
   weight (e.g., 800/900) or add a second cue (color, underline) so a 100-unit weight jump isn't
   the only signal.
4. **Type scale**: not a single mechanical fix — decide during implementation which few of the
   crowded sizes should move, and by how much, guided by the ladder the other, well-differentiated
   sizes on the same pages already establish (e.g., `17px`, `18.24px`, `22.4px` on `/cv` are
   already a working larger step; the fix is giving the small end similarly deliberate steps
   instead of near-duplicate values).

**Gate.** Extend or add assertions: every plate ID rendered in markup has a corresponding
`--ground` rule with a distinct hex from its immediate page-neighbor (a generalizable version of
this repo's existing per-route ground checks, if any exist — checked during implementation).
Assert no non-link element on `/cv` computes to the same color AND font-weight/decoration
combination as `.cv a`. Assert the third `model-band`'s `.band-term` computes a font-weight at
least 300 units above its rendering context (matching the other four instances), or an equivalent
non-weight distinguishing signal. A type-scale assertion is the least mechanically gateable of the
four — consider a looser check (e.g., a floor on the number of distinct sizes within any 3px band)
rather than skipping a gate for this item entirely.

**WHICH CHANGE TURNS EACH RED:**
- Remove any of the three new ground rules → that plate's `--ground` reverts to the base value →
  the ground-uniqueness assertion fails, reproducing this RCA's adjacency measurement.
- Revert the employer-name treatment to plain ochre-on-transparent matching `.cv a` → the
  non-link-color-collision assertion fails.
- Revert the third `.band-term`'s weight/signal change → the weight-contrast assertion fails.

## Conflicts checked against settled directives

Checked P-25, P-26, D30, D31, D38, DEF-52, D123. **D30** (light/dark deferred) is the closest
adjacent decision — this package does NOT touch theming; it corrects ground assignment WITHIN the
existing single dark theme, consistent with D30's own argument that the site's palette needs more
value range within dark, not a second theme. No conflict. **P-13** (contact links must be labelled
hyperlinks, never bare text) is not contradicted but is directionally supportive of item 2 — a
non-link element that visually claims to be a link is the mirror-image problem P-13 already
settled for the contact plate. No conflict found elsewhere.
