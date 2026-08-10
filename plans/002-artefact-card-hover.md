# 002 — Artefact record cards respond on hover/focus

- **Status**: TODO
- **Commit**: 44f85c3
- **Severity**: MEDIUM
- **Category**: Missed opportunities / Physicality

## Problem

`src/components/figures/Artefact.astro`'s `.card` (the `.lit-surface`) is the site's central
proof device — the hero and every project plate use it — and it is completely inert on
hover/focus today: no `:hover`/`:focus-within` rule exists anywhere in the file.

```css
/* src/components/figures/Artefact.astro:56 — current */
.card { padding: clamp(1.4rem, 2.6vw, 2.1rem); display: grid; gap: 0.85rem; }
```

## Target

A pointer-reactive light: a soft radial highlight fades in from the top of the card, plus a
subtle lift. Transform and opacity only (AUDIT.md category 5 — never trigger layout).

```css
/* target — src/components/figures/Artefact.astro, inside the existing <style> block */
.card {
  padding: clamp(1.4rem, 2.6vw, 2.1rem);
  display: grid; gap: 0.85rem;
  position: relative;
  transition: transform 200ms var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1));
}
.card::after {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(
    480px circle at 50% 0%,
    color-mix(in srgb, var(--ochre) 20%, transparent),
    transparent 62%
  );
  opacity: 0;
  transition: opacity 220ms ease;
  pointer-events: none;
}

@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: translateY(-3px); }
  .card:hover::after { opacity: 1; }
}
.card:focus-within { transform: translateY(-3px); }
.card:focus-within::after { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .card, .card::after { transition-property: opacity; }
  .card:hover, .card:focus-within { transform: none; }
}
```

`--ease-out` is not currently a token inside `Artefact.astro`'s scope (it is component-scoped
CSS) — the fallback value in the `var()` call is the same curve `nav.css:130` already uses, so
if the token is not visible here it still resolves to the identical curve.

## Repo conventions to follow

- `nav.css:70-77`'s `@media (hover: hover) and (pointer: fine)` guard is the exact pattern to
  copy — "Hover is a pointer concept. On touch, a tap fires it and it sticks."
- `.btn` (`global.css:298-312`) is this repo's only existing interactive-affordance transition;
  it animates `background`/`color` over `0.25s ease`. This card's hover is a spatial cue (lift),
  not a color swap, so category 2's decision order applies: "Moving/morphing on screen →
  ease-in-out" does not fit either (nothing morphs) — a lift toward the viewer is an *entrance*
  of attention, hence `ease-out`, matching `nav.css`'s own curve.

## Steps

1. Edit `src/components/figures/Artefact.astro`'s `<style>` block: add `position: relative` and
   the `transition` line to the existing `.card` rule (do not duplicate the rule).
2. Add the new `.card::after` rule immediately after `.card`.
3. Add the `@media (hover: hover) and (pointer: fine)` block.
4. Add the bare `.card:focus-within` rules (unconditional — keyboard users get the cue
   regardless of pointer type).
5. Add the `prefers-reduced-motion: reduce` override.

## Boundaries

- Do NOT add JS pointer tracking (`mousemove` + custom properties) — the radial gradient is
  fixed at `50% 0%`, not cursor-following. This keeps the effect CSS-only, consistent with the
  approved plan's "stay CSS-only... do not introduce a JS motion library."
- Do NOT change `.card`'s padding, gap, or any layout property.
- Do NOT touch `.mark`, `.fields`, or any other rule in this file.

## Verification

- **Mechanical**: `npm run build` — no new warnings.
- **Feel check**: hover a project plate's Artefact card with a mouse — confirm a soft light
  fades in from the top and the card lifts 3px, both under 250ms and clearly not simultaneous
  with any layout shift. Tab to the card with keyboard-only navigation (if any child becomes
  focusable) and confirm `:focus-within` produces the same cue. On a touch emulation (DevTools
  device toolbar), confirm tapping does not leave the glow "stuck" after the tap ends.
  - Rendering panel → `prefers-reduced-motion: reduce`: confirm the lift is gone but the glow
    opacity fade still occurs (comprehension aid, not movement — AUDIT.md category 6).
- **Done when**: CLS does not regress (transform/opacity only, verified in the Layout panel —
  no boxes highlighted as shifting); Lighthouse mobile stays at 100.
