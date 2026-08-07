# Development

### L-DEV-1 — Progressive enhancement means the static render is correct on its own

**Where introduced:** development · **Where caught:** testing, by the no-JS visual walkthrough
**Cost:** a whole plate unreadable without JavaScript, at 1.03:1, on a site whose own
`PRODUCT.md` promises "static HTML with near-zero JavaScript by default".

**What happened:** plate grounds were applied only by a scroll handler
(`plates.js:19` → `html.style.setProperty('--bg', hue)`). The CSS fallback
`background: var(--bg, #1b2440)` meant every plate rendered on ink navy without JS — including
the one that flips its text to ink for a light ground.

**Rule:** JavaScript may *enhance* a rendering, never *establish* it. If turning JS off changes
what a page means rather than how it moves, the baseline is wrong. Test both states.
