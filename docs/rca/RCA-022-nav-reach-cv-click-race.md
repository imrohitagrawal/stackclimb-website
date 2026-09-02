# RCA-022 — DEF-82: `tests/nav-reach.spec.js:92` (the CV click/navigation race)

Package `nav-reach-race` (DEF-82/D177), diagnosis-first, low severity, small blast radius.
**Outcome: QUEUED — no fix applied.** A real, demonstrated mechanism was found, but it could
not be reproduced through Playwright's own `click()` API under any load tested, so no fix is
mutation-provable per this run's own bar. Per `docs/practices/autonomous-run.md`: "a queued
package is a success, not a failure."

## What happened

DEF-82's row (filed during DEF-76/D174's own verification) records `tests/nav-reach.spec.js:92`
("/ — the CV stays reachable by activation, off the act, not the nav") failing with
`expect(page).toHaveURL(/\/cv$/)` timing out at 5000ms, URL stuck on `/`, in a **plain,
unstressed** `npx playwright test` full-suite run. D168 grouped this with two `hero-motion.spec.js`
flakes under one theory: "passes isolated, fails under full-suite load, one cause nobody has
found." DEF-76/D174 diagnosed and fixed the `hero-motion.spec.js:95` half of that group (a
transient-class-observation race) and explicitly left this one open as "a DIFFERENT mechanism —
a click/navigation race, not a class-observation race."

## Investigation

**Read the code path first.** The CV link on `/` lives in `src/components/ProofPlate.astro:48`
(`<a href="/cv">The full record</a>`), inside `.plate-copy`, itself a child of `.plate-grid`
inside `<Plate id="proof">`. No click handler anywhere touches it — `src/scripts/nav.js` only
listens inside `.site-nav`, and `src/scripts/plates.js` only handles `#hash`/`?at=` landings. So
navigation is a plain, unintercepted `<a href>` — any race has to be about the click's target
coordinate or timing, not application JS.

**Two real, live mechanisms sit on this exact element's path to being clicked:**

1. `src/styles/motion.css:79-91` — `reveal.js`'s `IntersectionObserver` adds `.in-view` to a
   plate on scroll-into-view, and `.plate.in-view .plate-grid > *` runs a 420ms
   `opacity`/`transform: translateY(16px) -> none` on the WHOLE `.plate-copy` block (a rigid
   move of every descendant, including the CV link, together).
2. `src/styles/global.css:36` — `html { scroll-behavior: smooth; }`, global, not scoped to
   in-app navigation. `#proof` sits roughly 1300px down the page, so scrolling it into view (as
   Playwright's `click()` does automatically before clicking an off-screen element) is a real,
   multi-hundred-millisecond **smooth-scroll animation**, not an instant jump. It is disabled
   only under `html.no-anim` (a transient class `plates.js` sets for ~400ms on `#hash`/`?at=`
   landings, not applicable to `page.goto('/')`) or `prefers-reduced-motion: reduce`.

Both are exactly the shape DEF-76's RCA-019 flagged as the underlying class: a transient,
time-based visual state that a snapshot-timed check can race against. Here the "snapshot" is
Playwright's own click-coordinate computation, and the transient state is the compound
scroll+reveal motion, not application code.

**Confirmed Playwright's stability check, read from source** (`node_modules/playwright-core`):
`_checkElementIsStable` polls `getBoundingClientRect()` on two consecutive `requestAnimationFrame`
callbacks and requires **exact floating-point equality** on all four rect fields; Chromium's
`rafCountForStablePosition()` is `1`, i.e. two consecutive identical frames are enough to declare
"stable" and let the click proceed. This is inherently a snapshot-comparison, not a true
"animation finished" signal — if the polling loop's own two samples happen to land on frames
where the transition or scroll produced (or briefly reported) an unchanged rect, "stable" is
declared even though the visible motion is not actually finished.

**Mechanism demonstrated directly** (constructed, not a natural repro): a small throwaway script
called `element.scrollIntoView()` on the CV link, captured its bounding box in the SAME
synchronous tick, and dispatched a raw `page.mouse.click()` at that captured coordinate:

```
Case A — box right after scrollIntoView (same tick): {"y":1736.97,...,"inView":false}
Case A URL after click at just-after-scroll coordinate: http://localhost:4321/
Case B — settled box (after 700ms): {"y":421.91,...}
Case B URL after click at settled coordinate: http://localhost:4321/cv
Vertical delta between just-after-scroll and settled box.y: 1315.07
```

This proves the mechanism is real and physically possible: a click dispatched at a coordinate
captured before the scroll (and reveal) settle lands on nothing that navigates, and the page is
left exactly where DEF-82's row describes — silently on `/`, no error, no exception. `inView:
false` at the same tick also confirms the `IntersectionObserver` callback is asynchronous
relative to the scroll call, consistent with the reveal firing only partway through, or after,
the scroll.

**What could NOT be shown: Playwright's own `click()` actually falling into this trap.**
Every attempt to reproduce the DEF-82 failure through the real, unmodified test and the real
`click()` API failed to reproduce it:

- Isolated `--repeat-each=30 --workers=8` with 8 CPU-pinned `yes` processes (load average ~58):
  **0/60 failures.**
- Isolated `--repeat-each=40 --workers=16` with 16 CPU-pinned `yes` processes (load average
  ~57): **0/80 failures.**
- A deliberately extreme stress run (`--workers=20` full suite, 24 CPU-pinned `yes` processes,
  load average 128-361): produced 8 UNRELATED failures elsewhere (server `ECONNRESET`/30s
  timeouts on `links.spec.js`, an accessibility test, a focus test, a hero-practice test) —
  general server/resource starvation, not this signature — while `nav-reach.spec.js:92` itself
  **passed**.
- Five sequential, fully unstressed `npx playwright test` full-suite runs (the exact condition
  DEF-82's row describes): **0/5 reproduced it** (607 passed, 3 skipped, 0 failed, every run).
- A targeted probe using a real CDP session to set `Emulation.setCPUThrottlingRate` to 12x
  around exactly the `goto` + `click` + `toHaveURL` sequence, repeated 25 times in one test:
  **0/25 misses.**

Playwright's `click()` internally re-scrolls and re-checks stability in a retry loop
(`_waitAndScrollIntoViewIfNeeded` -> `_checkElementIsStable`) rather than computing a coordinate
once, so under every load tested it correctly waited out the scroll and the 420ms transform
before dispatching. The demonstrated race requires the two-consecutive-identical-frames stability
check to be fooled specifically during either the scroll or the reveal transition — something
that, empirically, happens rarely enough that ~230 isolated repeats, one heavier-than-original
full-suite run, five clean full-suite runs, and a direct CPU-throttle attack on the exact code
path all missed it.

## Root cause (best evidence available, not fully proven)

**Most likely**: `scroll-behavior: smooth` (global, `global.css:36`) turns an automatic
`scrollIntoView` into a genuine multi-frame animation over a ~1300px distance, and the reveal
transform on the SAME element's ancestor overlaps it. Playwright's stability check is a
two-frame snapshot comparison, not a true motion-finished signal, and under the right renderer
scheduling stall (not reproduced here, but not excluded either) it can declare "stable" while
either the scroll or the transform is still technically in flight, causing the actual click
dispatch to land on a stale coordinate that no longer overlaps the link.

This is NOT proven to be what happened in the one observed DEF-82 failure — only demonstrated to
be a real, physically possible way to produce the exact symptom (URL stuck on `/`, no error).

## Where introduced

`scroll-behavior: smooth` (global.css) and the plate reveal (`motion.css`, reveal.js) both
predate this investigation and were each added deliberately for their own reasons (DEF-21's
instant-jump work explicitly documents smooth-scroll as the *default* the site wants for organic
scrolling, only bypassed for direct anchor jumps). Neither is a bug on its own; the interaction
with Playwright's own auto-scroll-then-click sequence is a test-execution hazard, not a defect a
site visitor would experience — a human scrolls and then clicks only once they see the target.

## Where caught

DEF-76/D174's own verification run (a plain full-suite `npx playwright test`), 2026-09-02.

## Cost

Low, and unclear whether it is a real gate hazard or a one-off Playwright scheduling artifact.
One observed failure in this repo's history against this test. `retries: 0` means it would red a
CI run if it recurs, but five clean full-suite runs here (plus DEF-76's own prior three clean
runs before its own one incidental catch) suggest the rate is very low.

## What was tried and explicitly NOT done

- **No fix was applied to `tests/nav-reach.spec.js`, `motion.css`, `reveal.js`, or `global.css`.**
  A plausible test-hardening change exists (make the test wait for the plate's `.in-view` class,
  or wait for `scrollY` to stabilize, before calling `.click()` — the same shape as DEF-76's
  "stop trying to catch a moving target opportunistically, record/wait for the settled state
  deterministically" fix) but it cannot be mutation-proved here: there is no reliable RED to
  prove it turns GREEN, because the failure cannot be reproduced on demand against the unfixed
  test. Shipping it would be guessing, which `docs/practices/autonomous-run.md` and `AGENTS.md`
  both bar ("If the cause stays genuinely unclear ... DO NOT guess a fix").
- No change was made to `scroll-behavior: smooth` or the reveal animation — P-18-adjacent
  (visual/motion decisions) and out of scope for a diagnosis package regardless.

## Recommendation for the next attempt

1. Try to catch the ACTUAL race with a `MutationObserver`/scroll-event recorder pattern (like
   RCA-019's), recording every `getBoundingClientRect()` Playwright-style stability sample
   in-page via a monkey-patched `requestAnimationFrame`, run across a very large repeat count
   (200+) with realistic (not extreme) full-suite-shaped load, to see if the two-frame-identical
   false positive can be caught directly with evidence rather than inferred.
2. If it recurs even once more under real full-suite conditions, that alone may be enough
   evidence to justify shipping the `.in-view`-wait test hardening as a defensive fix even without
   a full mutation-proof cycle — record that trade-off explicitly rather than silently.
3. Consider whether `scroll-behavior: smooth` is worth scoping OFF for Playwright's `baseURL`
   context specifically (a `reducedMotion: 'reduce'` context, or a small `page.addInitScript`
   forcing `html.no-anim`-equivalent CSS) purely for test stability — this changes ONLY what the
   test harness sees, not the visitor experience, and would remove BOTH mechanisms above at once
   without touching production CSS or DEF-76's own class-observation fix pattern.

## Evidence

- Mechanism demonstration output (this session, not committed — reconstructable from this
  document): `Case A` (stale coordinate) landed on `/`, `Case B` (settled coordinate) landed on
  `/cv`, delta 1315px.
- `node_modules/playwright-core/lib/coreBundle.js`: `_checkElementIsStable` (exact-equality,
  two-frame check) and `rafCountForStablePosition() { return 1; }` for Chromium — read directly
  from the installed package, not assumed from docs.
- Five full, unstressed `npx playwright test` runs in this session's worktree: 607 passed, 3
  skipped (D140 darwin geometry), 0 failed, every time — `nav-reach.spec.js` clean in all five.
- Isolated `--repeat-each` stress runs: 60/60 then 80/80 clean at 8- and 16-CPU-pinned-process
  load.
- One CPU-throttle-targeted probe (25 iterations, `Emulation.setCPUThrottlingRate: 12`, direct
  around the click+navigate sequence): 0/25 misses.
- One deliberately extreme stress run (20 workers, 24 CPU-pinned processes): produced 8
  UNRELATED failures (server/resource starvation) while this exact test passed — recorded to
  show the difference between "broke everything" and the specific, narrow signature DEF-82 names.
