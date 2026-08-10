# 003 — `.site-nav .brand` gets a hover style

- **Status**: SHIPPED — `hero-animations-wordmark`, D55 (08-11)
- **Commit**: 44f85c3
- **Severity**: LOW
- **Category**: Cohesion & tokens

## Problem

`.site-nav .brand` (`src/styles/nav.css:31-37`) is the one interactive element site-wide with no
hover style at all. Every other link in the bar (`.site-nav nav a`, `.site-nav .chip`) has one
at `nav.css:71-77`.

## Target

```css
/* target — src/styles/nav.css, added after the .site-nav .brand em rule (line 50) */
.site-nav .brand { transition: opacity 0.25s ease; }

@media (hover: hover) and (pointer: fine) {
  .site-nav .brand:hover { opacity: 0.82; }
}
.site-nav .brand:focus-visible { opacity: 0.82; }

@media (prefers-reduced-motion: reduce) {
  .site-nav .brand { transition: none; }
}
```

## Repo conventions to follow

- `0.25s ease` is copied verbatim from `.btn`'s existing transition (`global.css:308`,
  `transition: background 0.25s ease, color 0.25s ease;`) — a hover/color-adjacent change uses
  `ease` per AUDIT.md's decision order, and this repo already picked `0.25s ease` for exactly
  this class of interaction. Reuse it, do not invent a new duration.
- The `@media (hover: hover) and (pointer: fine)` guard is copied from `nav.css:71`, same file,
  twelve lines above where this rule lands.
- `:focus-visible` already has a global ring (`global.css:63`); this adds a second, cheap
  confirmation (dimmed opacity) without fighting the ring — it does not replace it.

## Steps

1. Edit `src/styles/nav.css`: add the `.site-nav .brand { transition: opacity 0.25s ease; }`
   rule immediately after the existing `.site-nav .brand em { ... }` block (ends line 50).
2. Add `.site-nav .brand:hover { opacity: 0.82; }` inside the existing
   `@media (hover: hover) and (pointer: fine)` block at line 71-77 (do not open a second
   identical media block).
3. Add the bare `.site-nav .brand:focus-visible { opacity: 0.82; }` rule, unconditional.
4. Add `.site-nav .brand { transition: none; }` inside a
   `@media (prefers-reduced-motion: reduce)` block — `nav.css:193-196` already has one; add the
   line there rather than opening a second block.

## Boundaries

- Do NOT change `.brand`'s layout (`display: flex; align-items: center; gap: 0.6rem;`).
- Do NOT add a hover style to `.brand-mark` (the image) or `.brand em` individually — the whole
  lockup dims together as one link.

## Verification

- **Mechanical**: `npm run build` — no new warnings.
- **Feel check**: hover the nav brand lockup (chevron + wordmark + name) — confirm the whole
  group dims together to ~82% opacity over a quarter second, with no flash or per-element lag.
  Tab to it with keyboard and confirm the same dim appears alongside the focus ring, not
  instead of it.
- **Done when**: `tests/nav-contrast.mjs` still passes (dimming to 0.82 opacity must not drop
  any nav text below AA on the darkest ground it is measured against — re-run the gate, don't
  assume).
