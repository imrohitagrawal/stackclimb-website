# RCA-003 — The fixed nav has no ground, and is unreadable on 46% of the page

**Status:** written before the fix, per `AGENTS.md`. **Severity:** High — live on
`stackclimb.com` right now, and it is a WCAG 2.1 AA failure the site's own Definition of Done
requires it to pass.
**Found by:** re-measuring a fan-out finding rather than accepting it. The finding that started
this was **refuted**; the defect it led to is real and bigger.

---

## What is wrong

`.site-nav` is `position: fixed` across the top of every page and has **no background of any
kind** — `src/styles/global.css:56-64` sets position, layout, padding, `color` and a transition,
and nothing else. Bone-coloured text floats directly over whatever plate happens to be scrolled
underneath it.

Seven plates scroll under that bar. One of them, `#private`, is near-white paper
(`--ground: #e8e2d4`). Several others carry near-white `.lit-surface` panels. Wherever one of
those passes under the nav, bone text sits on bone ground.

**Measured, in rendered pixels, on the built site:**

| | Desktop 1440×900 | Mobile 390×844 |
|---|---|---|
| Scroll positions with a nav link below 4.5:1 | **22 of 48 — 46%** | **26 of 78 — 33%** |
| Worst ratio | **1.00:1** | 1.03:1 |

1.00:1 is not "low contrast". At `y=4920` the foreground and the background are the same value —
`rgb(22,33,60)` on `rgb(22,33,60)`. The link is invisible.

There is a second, compounding fault. `global.css:65` reads
`html[data-theme='light'] .site-nav { color: var(--ink) }` — the nav turns dark when the light
plate is active. `plates.js:25` flips that theme when a plate crosses the **middle** of the
viewport, but the nav sits at the **top**. So for roughly 480px of scroll the nav has already
turned dark while the paper plate is still behind it, and for another stretch the reverse. The
enhancement cannot be made correct by retiming it; the nav is in a different part of the screen
from the thing it is reacting to.

## Why no gate caught it

This is the part worth keeping.

The site has three contrast checks and **all three are structurally incapable of seeing this**:

| Check | Why it is blind |
|---|---|
| `dod.spec.js` axe scan | Scopes to `#${id}` — plates only. The nav is outside every plate. DEF-14 already recorded that "nothing outside `.plate` is scanned" and it is still true |
| `tests/boundary-check.mjs` | Samples plate **seams**. Never samples `.site-nav` |
| axe's `color-contrast` rule generally | Reads the **DOM**. `.site-nav` has no background, so its computed background is `rgba(0,0,0,0)` — axe walks up to find an ancestor background, finds the page's, and scores against a colour that is not what is rendered there |

So the suite reports **18 passed, 0 failed** and the contrast gate reports **AA ok, worst 7.56:1**
while a navigation link is invisible at nearly half of all scroll positions. Every gate was green
and every gate was measuring something else.

**The lesson, stated plainly:** a fixed element has no fixed backdrop, so no DOM-reading tool can
score it. It has to be measured in pixels, at many scroll positions. Nothing in this repo did
that until tonight.

## Where it was introduced, and where it was caught

- **Introduced:** at the original build. The nav has never had a ground. It was survivable while
  every plate was dark; **DEF-18's fix and the value ladder (D18) added the near-white `#private`
  paper plate and the `.lit-surface` panels**, which is what turned a latent design choice into a
  live failure. Nobody re-checked the nav when the palette gained a light ground.
- **Caught:** 2026-08-09, by writing a pixel sampler to *verify a different claim*. Five review
  passes, a scored critique, two review agents and a cross-model pass had all read this page.
- **Cost:** the site's primary navigation is unusable for part of every visit, on the page whose
  Definition of Done item 4 reads "contrast meets WCAG 2.1 AA". For a candidate whose argument is
  that he builds systems that catch their own failures, a green gate over an invisible nav is the
  most expensive possible bug.

## What was refuted on the way

The fan-out finding that led here said DEF-6 was live: *"JS on + module dead = 1.03:1, 14 nodes."*
**That is refuted.** `.js-ground` gates zero CSS rules — the rule it selected,
`.js-ground .plate { background: transparent }`, was deleted by commit `75ea9a7` (the DEF-30 fix).
Verified: `grep -c js-ground dist/_astro/*.css` returns **0**.

A second recommendation was also refuted by measurement. It claimed giving the nav a solid ground
alone gives "0 of 48 failing, worst 15.60:1". Measured against the site as it then stood, that
change alone leaves **8 of 48 still failing** — because `html[data-theme='light'] .site-nav
{ color: var(--ink) }` then paints dark text on the new dark ground. Accepting the recommendation
as written would have shipped a fix that closed 64% of the defect and reported it closed.

**Corrected after the mutation run, because the first explanation was not quite right.** The
load-bearing pair is not "ground + delete the ink rule". It is **ground + nothing flipping the
theme**. Mutation 2 put the ink rule back with the ground in place and the gate stayed green at
15.60:1 — because deleting the dead observer also removed the only code that ever set
`html.dataset.theme`, so the rule can no longer activate. `<html data-theme="dark">` is now
static. The ink rule is still deleted, since a rule that only works when a deleted observer
returns is worse than no rule. But the honest statement of the mechanism is: **the nav is safe
because it has its own ground and nothing changes its colour any more.** If Phase 2 adds an
observer that sets `data-theme` again, this gate is what stops the defect coming back with it.

## The fix, and what it costs

Give the nav its own ground, and stop it reacting to what is behind it.

```css
.site-nav { background: var(--nav-ground); }   /* #0e1322 */
/* html[data-theme='light'] .site-nav { color: var(--ink) }  — deleted */
```

**Measured result: 0 of 48 desktop and 0 of 78 mobile failing positions, worst 15.60:1.**

**The honest cost:** the nav stops being a hairline floating on the plate and becomes a solid bar.
That is a change to a design choice, not a neutral bug fix, and it is the owner's to reverse.

Two alternatives were measured rather than assumed, so the choice is real:

| Variant | Failing positions | Worst | Verdict |
|---|---|---|---|
| **Solid `#0e1322`** | **0 / 0** | **15.60:1** | **Chosen** |
| Translucent + `backdrop-filter: blur(14px)` | 0 / 0 | 6.70:1 | Passes AA. **Rejected on two grounds:** looked at the render and the plate headline ghosts through the bar like an artifact; and a `backdrop-filter` on a fixed bar over the scrolling `mix-blend-mode` grain layer is the combination most likely to cost frames, on a site whose strongest measured property is 60fps with zero long tasks |
| Gradient scrim | 8 / 12 | 1.00:1 | **Fails.** Recorded so it is not re-proposed |

If the owner prefers the translucent look, it is a two-line swap and it passes AA — the numbers
are above and the reason it was not chosen is aesthetic and precautionary, not a measurement.

## What ships with it, or the class recurs

A gate. `tests/nav-contrast.mjs` walks the full scroll at 120px steps, samples every `.site-nav`
link against its **rendered** backdrop at both viewports, and fails below 4.5:1.

**Which change turns it red:** revert the `background` declaration and it reports 22 failing
positions at 1.00:1 desktop, 26 at 1.03:1 mobile. That is not a prediction — it is the baseline
measured before the fix.
