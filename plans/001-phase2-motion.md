# 001 — Phase 2 motion: scroll-linked plate entry

- **Status**: SHIPPED — `hero-animations-wordmark`, D55 (08-11); covered by `tests/motion.spec.js`
- **Commit**: 44f85c3
- **Severity**: MEDIUM
- **Category**: Missed opportunities / Cohesion
- **Estimated scope**: 2 files (new `src/styles/motion.css`, new `src/scripts/reveal.js`), plus a two-line import in `src/layouts/Layout.astro`

## Problem

`document.getAnimations()` returns 0 and zero `@keyframes`/scroll motion exist anywhere in
`src/styles/`. Plates 2 onward (`overview`, `citevyn`, `quorum`, `saafsaans`, `narratwin`,
`private`, `contact`) teleport into view with no entry motion — a state change (off-screen →
full-viewport reveal) that currently has no transition at all. This is the "state changes that
teleport" case in AUDIT.md category 8.

The hero (`.hero`, plate `id="top"`) is explicitly OUT of scope — it is above the fold and
visible on first paint; delaying its opacity would cost perceived load speed and is not a scroll
entrance.

## Target

Direct children of `.plate-grid` (i.e. `.plate-copy`, `.hero-ledger` where present, `.plate-figure`)
on every plate except `.hero` start at `opacity: 0; transform: translateY(16px)` and animate to
`opacity: 1; transform: none` once their plate enters the viewport, with a 60ms stagger between
the 1st/2nd/3rd child:

```css
/* target — src/styles/motion.css */
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1); /* already used at nav.css:130, reused not reinvented */
}

.plate:not(.hero) .plate-grid > * {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 420ms var(--ease-out), transform 420ms var(--ease-out);
}
.plate:not(.hero) .plate-grid > *:nth-child(1) { transition-delay: 0ms; }
.plate:not(.hero) .plate-grid > *:nth-child(2) { transition-delay: 60ms; }
.plate:not(.hero) .plate-grid > *:nth-child(3) { transition-delay: 120ms; }

.plate.in-view .plate-grid > * {
  opacity: 1;
  transform: none;
}

/* No JS, reduced motion, or the footer toggle off: show content immediately, no transition. */
html:not(.motion-ready) .plate:not(.hero) .plate-grid > *,
[data-motion='off'] .plate:not(.hero) .plate-grid > *,
html.no-anim .plate:not(.hero) .plate-grid > * {
  opacity: 1;
  transform: none;
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .plate:not(.hero) .plate-grid > * {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

Only `opacity` and `transform` animate (AUDIT.md category 5 — never `width`/`height`/`top`/`left`),
so this cannot add layout CLS: the element keeps its layout box at `opacity: 0`.

`html:not(.motion-ready)` is the no-JS / not-yet-observed default: content is fully visible with
no animation unless a script has proven it can reveal it later. This is the DEF-1 shape this repo
already applies elsewhere ("a control that dies with the script is the fault this site argues
against") — the reveal is progressive enhancement, never a hidden-by-default risk.

```js
// target — src/scripts/reveal.js
// Phase 2 scroll entry. Progressive enhancement only: motion.css shows every
// plate fully visible until this script proves it can reveal them on scroll
// (html.motion-ready), so a thrown error or no-JS visitor never loses content
// (DEF-1's bar). Skips entirely under prefers-reduced-motion or the footer
// motion toggle — both already forced visible by CSS, so there is nothing
// for the observer to do.
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const toggledOff = document.documentElement.dataset.motion === 'off';

if (!reduced && !toggledOff && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-ready');

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.plate:not(.hero)').forEach((plate) => io.observe(plate));
}
```

## Repo conventions to follow

- The `cubic-bezier(0.23, 1, 0.32, 1)` curve is already this repo's entrance curve —
  `src/styles/nav.css:130` uses it for the mobile menu panel's `@starting-style` entrance. Reuse
  it verbatim, do not invent a second "strong ease-out."
- `html.no-anim` (transient, set by `src/scripts/plates.js` during anchor-jump) is a DIFFERENT
  mechanism from the footer's persisted `[data-motion='off']` (Plan 003) — keep both selectors,
  do not merge them into one class, per the approved plan's explicit instruction.
- New Phase-1-style surface files (`avatar.css`, `overview.css`, `contact.css`) already live
  outside `global.css`, which is grandfathered at 500 lines and may not grow — put this in its
  own `src/styles/motion.css`, imported from `Layout.astro` the same way those three are.
- `src/scripts/plates.js`'s own header comment is the model for how a script here documents
  itself: state what it does, and what happens if it never runs.

## Steps

1. Create `src/styles/motion.css` with the CSS block under Target above.
2. Import it in `src/layouts/Layout.astro` alongside the other Phase-1 style imports (after
   `../styles/contact.css`).
3. Create `src/scripts/reveal.js` with the JS block under Target above.
4. Import it in the existing `<script>` block in `Layout.astro`, alongside `plates.js`/`nav.js`.
5. Add `.motion-ready` as a legal value the toggle script (Plan 003) does not need to touch —
   this script owns setting it, the toggle script only ever reads/writes `data-motion`.

## Boundaries

- Do NOT animate the hero plate (`id="top"`, `class="hero"`).
- Do NOT touch `width`/`height`/`top`/`left`/`margin`/`padding` — opacity and transform only.
- Do NOT add a scroll-driven (`animation-timeline: view()`) implementation — no browser-support
  fallback story was scoped, and the IntersectionObserver version above degrades to "fully
  visible" in every browser, which is the simpler and safer default for this repo's stated
  near-zero-JS, no-broken-by-default posture.
- Do NOT re-trigger the reveal on repeat scroll — `io.unobserve` after the first reveal is
  intentional; plates do not re-hide when scrolled past.

## Verification

- **Mechanical**: `npm run build` — no new warnings. `node -e "..."` is not needed; this is
  pure CSS/JS with no build-time check beyond the Astro build succeeding.
- **Feel check**: load `/`, scroll slowly past the `overview` plate boundary and confirm the
  copy column, then the figure column, fade+lift in with a barely-visible stagger (60ms is
  subtle by design — confirm it does not look simultaneous nor sequential-and-slow).
  - DevTools Animations panel, playback 10%: confirm only `opacity`/`transform` are animating.
  - Rendering panel → emulate `prefers-reduced-motion: reduce`: reload, confirm every plate is
    immediately fully visible with no animation.
  - Disable JavaScript entirely: reload, confirm every plate is immediately fully visible (the
    `html:not(.motion-ready)` default).
- **Done when**: `document.getAnimations()` on a mid-scroll `/` load returns entries during the
  reveal window and 0 once settled; Lighthouse mobile Performance/Accessibility stay at 100
  (the hold-the-line gate); CLS does not regress from the current measured baseline.
