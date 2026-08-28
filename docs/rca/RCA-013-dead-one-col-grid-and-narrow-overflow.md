# RCA-013 — `/experience` and `/how-i-build` render at 48% width, and overflow at 320/360px

**Status: written before the fix, per AGENTS.md's order, on 2026-08-28.**

D153 (the three-page critique) flagged this as P3. Reproduced fresh from a clean `main`
(`d1d42bf`), independent of the critique's own numbers, per AGENTS.md's "execution is the source
of truth."

## What happened

Three independent defects share one page pair (`/experience`, `/how-i-build`):

1. **The `.plate-grid.one-col` and `.plate-copy.wide` classes are dead on these two pages.** They
   are defined exactly once, in `src/styles/project.css`. `src/pages/projects/[slug].astro`
   imports that file; `src/pages/experience.astro` and `src/pages/how-i-build.astro` do not — they
   import `experience.css` and `how-i-build.css` respectively, neither of which defines or
   re-exports the rule. The markup on both pages still carries the classes (`class="plate-grid
   one-col"`, `class="plate-copy wide"`), so they render, just with none of the styling the class
   names promise.
2. **`.plate-copy` has no `min-width: 0`; `.plate-figure` does** (`global.css:219`). In a CSS grid,
   a track's default minimum size is `auto` (its content's intrinsic size), not `0` — `min-width:
   0` is what lets a track shrink below that. Without it on `.plate-copy`, long unbreakable content
   (a URL, a wrapped word) can force the track wider than its column, pushing the whole page wider
   than the viewport.
3. **`.era-org` puts a role and its date range in one `<p>`, capped at `52ch`**
   (`global.css:171` — `.plate-copy p { max-width: 52ch }` — applies to every paragraph in
   `.plate-copy`, `.era-org` included). At narrow widths the combined text wraps mid-phrase,
   orphaning the date range onto its own line with nothing to anchor it, which reads as a
   formatting accident rather than a designed line break.

## The measurement

Reproduced fresh from `git status` clean / `npm run build`, served with `astro preview` on
`http://localhost:4321`, measured with Playwright at 1440px unless noted:

```
$ grep -n "one-col\|\.wide\b" src/styles/*.css
src/styles/project.css:21:.plate-grid.one-col { ... }
src/styles/project.css:25:.plate-copy.wide { ... }
   (defined nowhere else)

$ grep -n "import.*css" src/pages/experience.astro src/pages/how-i-build.astro \
    src/pages/projects/\[slug\].astro
experience.astro:12:   import '../styles/experience.css';
how-i-build.astro:14:  import '../styles/how-i-build.css';
projects/[slug].astro:29:  import '../../styles/project.css';   <- the only importer

=== Grid fill, measured live (Playwright, 1440px) ===
/experience       — 2 .plate-grid.one-col elements, frame 1122.8px, copy 544px  -> 48.4% fill
/how-i-build      — 3 .plate-grid.one-col elements, frame 1122.8px, copy 544px  -> 48.4% fill
/projects/citevyn — 2 .plate-grid.one-col elements, frame 1122.8px, copy 1122.8px -> 100% fill
   (citevyn imports project.css; the other two don't — same class, opposite result)

=== min-width asymmetry ===
$ grep -n "min-width" src/styles/global.css
219: .plate-figure { display: grid; gap: 0; min-width: 0; }
   (no ".plate-copy { ... min-width: 0 ... }" anywhere in the file)

=== Narrow-viewport overflow, measured live (Playwright, /how-i-build) ===
320px: scrollWidth 383 vs innerWidth 320   (63px overflow)
360px: scrollWidth 383 vs innerWidth 360   (23px overflow)
390px: scrollWidth 390 vs innerWidth 390   (clean — this is why the 390px gate never caught it)

=== .era-org markup ===
$ sed -n '26,31p' src/pages/experience.astro
  <p class="era-org">
    {e.job.org} — {e.job.role}
    <span class="era-dates">{e.job.from} – {e.job.to}</span>
  </p>
$ grep -n "\.plate-copy p {" src/styles/global.css
168: .plate-copy p { ... max-width: 52ch; ... }   <- applies to .era-org, org+role+dates as one run

=== The committed baseline freezes the defect ===
$ (search tests/geometry-baseline.linux.json for width 544 on these routes)
desktop/w1440//experience.row.evolution-record/ctas#0.box       [159, 545, 544, 51]
desktop/w1440//how-i-build.row.published-skills/ctas#0.box      [159, 649, 544, 51]
desktop/w1440//how-i-build.row.published-skills/skill-repos#0.box [159, 504, 544, 123]
   (the gate's own recorded "correct" width for these rows IS the 544px bug)
```

## Why nothing caught it

`tests/geometry.spec.js` compares against a committed baseline, and the baseline was captured
*after* these classes went dead — so it faithfully records 544px as the expected width. The gate
proves the page hasn't drifted from its own prior (defective) state. It never asserted the width
was correct. `tests/visual-baselines.spec.js` doesn't cover either page (confirmed: it clips only
the home page's nav band). The 390px-only overflow check in this repo's own manual QA habits
(and the fact that 390 is the canonical mobile width cited throughout `AGENTS.md` and the
Definition of Done) never exercised 320 or 360, where the real overflow shows up — 390px itself is
clean, which is presumably why this shipped past visual review at that width.

## Where it was introduced

`.one-col`/`.wide` were authored once, for the project-detail template, in `project.css` — a file
scoped to that one page family. `experience.astro` and `how-i-build.astro` picked up the same
class names (likely copy-pasted from that template or a shared draft) without importing the
stylesheet that defines them, so the classes have been inert since whichever commit first added
them to these two pages — not dated further here; not load-bearing to the fix. `.plate-figure`
got its `min-width: 0` when SVG/image figures were added to plates and started overflowing;
`.plate-copy` never received the same fix because text content doesn't normally force an
overflow — until a URL or unbroken token in this exact grid context does. `.era-org` combined role
and dates in one paragraph from the page's first version; the 52ch cap was written for prose
paragraphs and applies here as a side effect, not a deliberate choice for this element.

## Where it was caught

Not by any gate. By D153's critique, computing `getComputedStyle` on the live page rather than
trusting that a class name doing nothing would be visible in a screenshot at a glance — and by
this RCA's independent reproduction of every number.

## Cost

Two of six site pages render their primary content at under half the available width, with roughly
45% of the frame sitting empty beside it — the single largest visual defect D153 found across all
three pages. The 320/360px overflow is a real horizontal-scroll bug on two named-mainstream phone
widths (both narrower than the 390px this repo's own Definition of Done checks), and the orphaned
date range is a legibility defect on the page whose whole subject is a fourteen-year career
timeline — the dates are the content.

## The fix

1. **`experience.astro` and `how-i-build.astro`**: import the rule the classes need. Options,
   decided during implementation: (a) import `project.css` directly (risk: pulls in other rules
   scoped to the project-detail template that don't apply here — check `project.css`'s full
   contents before choosing this), or (b) move `.plate-grid.one-col` / `.plate-copy.wide` into
   `global.css` (or a new shared partial) since three unrelated page families now need them,
   consistent with AGENTS.md's "index, don't inline" modularization guidance once a rule is used
   by more than its original owner.
2. **`global.css:219`**: add `min-width: 0` to `.plate-copy`, matching `.plate-figure`'s existing
   rule — same grid, same failure mode, same fix.
3. **`experience.astro` / `experience.css`**: split `.era-org` so the org+role run and the date
   range are no longer forced to wrap as one unbroken phrase — e.g. the date range as a sibling
   element with its own layout (`display: block` or a flex row with controlled wrapping) rather
   than an inline `<span>` inheriting the parent paragraph's `52ch` cap and inline flow.

**Gate.** Extend `tests/geometry.spec.js`'s expectations (or a new assertion) so a `.plate-grid`
carrying `one-col` is asserted to actually reach near-full frame width on desktop, not merely
matched against whatever the baseline currently records — otherwise a future dead-class regression
re-freezes the same way this one did. Add a narrow-viewport (320px, 360px) overflow check
alongside the existing 390px one, since 390 alone proved insufficient to catch this. Add an
assertion that `.era-org`'s date range renders as a distinct element/row, not text wrapped inside
the same paragraph as the org/role.

**WHICH CHANGE TURNS EACH RED:**
- Remove the new import (or revert the moved rule) → `.one-col`/`.wide` go dead again → the
  full-width assertion fails, reproducing the 48.4%-fill measurement above.
- Remove `min-width: 0` from `.plate-copy` → the 320/360px overflow assertion fails, reproducing
  `scrollWidth: 383` at both widths.
- Revert `.era-org`'s split → the date-range-is-a-distinct-element assertion fails.

## Baseline impact — confirmed, not assumed

`tests/geometry-baseline.linux.json` currently records the *defective* 544px width for both pages'
`one-col` rows (`desktop/w1440//experience.row.evolution-record/ctas#0.box`,
`desktop/w1440//how-i-build.row.published-skills/*`, and their `mobile` project counterparts —
confirmed by direct search of the committed file, not assumed from D153's text). Fixing item 1
will correctly turn this gate red, and it **cannot be verified or regenerated on a laptop** —
DEF-59's guard refuses a darwin-written baseline outright, and D140's local-baseline guard already
marks the darwin set stale independent of this change. This needs the same CI-dispatch flow used
for P1 and P2: `gh workflow run gates.yml --ref <branch> -f update_geometry_baseline=true -f
update_visual_baselines=false` (visual baselines don't cover these routes — confirmed above),
download the artifact, diff it programmatically against the committed file, confirm only
`/experience` and `/how-i-build` rows changed, before committing it in.

## Addendum — item 2's fix needed a second piece (found during the fix, per
## this repo's own "re-verify every number as you fix it" standard)

`min-width: 0` alone (item 2) did not fully close the 320/360px overflow it
targets. Measured on the branch after applying it: /how-i-build's 360px
overflow closed exactly as predicted (23px → 0), but 320px only dropped from
63px to 34px. Traced with a `Range`-based text-overflow scan (not
`getBoundingClientRect` on elements — the offending boxes never grow past
the viewport, only the text painted inside them does): the residual 34px is
`h2.plate-title`'s own text ("Evals and observability, specifically.") — an
unbreakable uppercase word forced past its now-narrower `.plate-copy` track,
`overflow: visible` by default. Same failure-mode class this RCA already
names for item 2 ("unbreakable content... pushing the whole page wider than
the viewport"), surfacing on the title element instead of the track once the
track itself stopped absorbing it. The home page's own "Two ledgers,
deliberately kept apart." title carried the identical defect, independently
(6px at 320px) — `.plate-title` is used site-wide, RCA-013 never touched it.

Fix: `overflow-wrap: anywhere` on the shared `.plate-title` rule
(`global.css`). Verified live: 0px overflow at 320/360 on every built route,
not just the two this package touches. Isolated by testing each candidate
selector alone before landing on this one — `.plate-title` alone fully
closes it; `.model-band .band-lead`/`.band-support` (also considered)
contribute nothing to this specific overflow and were not touched.

**WHICH CHANGE TURNS THIS RED:** revert `overflow-wrap: anywhere` from
`.plate-title` — `tests/dod.spec.js`'s widened overflow check (320/360/390/
768/1440) reproduces 34px on /how-i-build and 6px on `/`.

## Conflicts checked against settled directives

Checked P-25, P-26, D30, D31, D38, DEF-52, D123 (the settled items this loop's instructions name).
None govern layout/grid mechanics, `min-width`, or paragraph structure — no copy claims, no
approximate-disclaimer wording, no theming, no CV format, no phone number, no email obfuscation,
and no impeccable-tree build question is touched by this package. **No conflict found.**
