# RCA-004 — on a phone the navigation reaches nothing

**Defect:** DEF-42 · **Severity:** HIGH · **Written:** 2026-08-09, before the fix
**Also closed here:** DEF-47 (new — `global.css` had grown past its ceiling)

---

## What a visitor gets today

Measured on the built site, five viewports, `getBoundingClientRect` on every
`<a>` inside `.site-nav`:

| Viewport | Page height | Screens of scroll | Nav links reachable |
|---|---|---|---|
| 360 × 780 | 12,506 px | 16.0 | brand · Email me |
| 390 × 844 | 12,013 px | 14.2 | brand · Email me |
| 768 × 1024 | 10,976 px | 10.7 | brand · Email me |
| 900 × 900 | 10,636 px | 11.8 | brand · Email me |
| 1440 × 900 | 7,774 px | 8.6 | brand · **Systems · CV · Contact** · Email me |

`Systems`, `CV` and `Contact` measure `0 × 0` at `display: none` on every
viewport at or below 900 px. They are in the HTML and they render nowhere.

So a phone visitor reads fourteen screens with two controls: go home, or send
mail. There is no route to the CV and no route to the contact plate except
scrolling to the bottom of a twelve-thousand-pixel page.

## Where it came from

`src/styles/global.css:490`

```css
@media (max-width: 900px) {
  .site-nav nav a:not(.chip) { display: none; }
}
```

This is not a regression. It has been in the file since the nav was written.
The desktop bar was designed as a single row; below 900 px the row does not fit,
and hiding the links is the cheapest way to make it fit. Nothing was put in
their place.

## Where it should have been caught, and was not

Five review passes read this page. None of them saw it, and the reason is the
same each time — **every contrast, focus and link check measured the desktop
nav, or measured the mobile nav without asking how many links it had.**

- `tests/nav-contrast.mjs` samples what is *visible*. At 390 px that is two
  elements, so it measured two elements and reported them green. A gate that
  scores whatever it finds cannot notice that it found less than it should.
- `tests/links.spec.js` resolves every `href` in the DOM. All four resolve —
  `display: none` does not change an `href`. This is DEF-41's lesson one level
  further out: `count()` proves existence, `href` proves intent, **and neither
  proves the link is reachable by a finger.**
- axe has no rule for "this navigation is empty at this width".

The defect was finally named by `/impeccable critique`, which raised it from
Medium to HIGH, and by the owner's own acceptance test: a recruiter opening the
site on a phone is looking for a CV.

## Cost

The site's stated acceptance test is that within 30–60 seconds a recruiter
should feel *"I should call this person."* `docs/STATUS.md` O-30SEC records that
a recruiter looks for the CV first. On a phone — which is where a link shared
in a message or on LinkedIn is opened — the CV is not linked from anywhere the
visitor can see after the first screen.

Mitigated on 09 Aug by a CV button in the hero, so the link exists in the first
viewport. From screen 2 of 14 onward, nothing.

## The second defect, found while measuring

`src/styles/global.css` is **505 lines**. `AGENTS.md` (D8, inherited from
NarraTwin `ADR/0047:55`) grandfathers pre-existing oversized files at **500
lines and forbids them growing past it**. The handoff from the last session
recorded it at 498 and told the next session not to add to it; it was already
over by then and nobody ran `wc -l`.

Recorded as **DEF-47**. It is the same shape as every other defect in this
ledger: a limit written in prose, never executed. The fix here is structural —
the nav rules leave `global.css` for a file of their own — and the limit itself
becomes a gate in the same change, so the next breach is red rather than silent.

---

## The fix, and why this shape

**A native `<details>` disclosure. No JavaScript required to open it.**

Three candidates were considered.

| Option | Rejected because |
|---|---|
| A second row of links in the bar on mobile | The bar is 68.5 px; a second row makes it ~95 px, 11% of an 844 px viewport, permanently, on a page that is fourteen screens tall. Plates are `100svh` and the nav eats them |
| A `<button>` + JS panel | The one thing every gate on this site is built to prevent: a control that does nothing when the script fails. DEF-1 was exactly that — a plate invisible without JS on a site promising near-zero JS |
| Forcing one `<details>` open on desktop via `::details-content` | Depends on a pseudo-element with uneven engine support, to save four lines of markup. Clever, not clear |

**Chosen:** one array of destinations in the layout frontmatter, rendered into
two sibling elements — a flat row for ≥ 901 px and a `<details>` panel for
≤ 900 px — with CSS showing exactly one of them.

The duplication in the DOM is deliberate and it is *derived*, not typed. A
hand-maintained second copy of the link list would be the fourth instance of the
failure this repo keeps hitting — DEF-10's hand-typed routes, DEF-44's
hand-typed plate ids, `touch.css`'s hand-typed selectors. Adding a destination
edits one array and both surfaces change.

`display: none` removes the inactive copy from the accessibility tree, so a
screen reader is never offered two menus.

### Why the "Email me" chip moves into the panel on mobile

Measured at 390 px: brand 172.9 px + chip 111.3 px + 40 px padding = 324.2 px
used, **65.8 px free**. A 44 px control plus a gap fits at 390 and does not fit
at 360, where 35.8 px are free. Keeping both would buy one tap and cost a
horizontal scrollbar on a Galaxy S8.

Email is not lost: it is the first item in the panel, drawn as the same ochre
chip, at a larger target than the 111 × 36 bar version — and it is still in the
hero CTA and on the contact plate.

### What JavaScript is still added, and what breaks without it

Nine lines, all enhancement. Without them the menu opens, navigates and closes
by reload exactly as a `<details>` does:

- close the panel when a link inside it is activated — a same-page fragment link
  does not reload, so the panel would otherwise stay open over the destination
- close on `Escape`, close on a click outside

## The gate that holds it

`tests/nav-reach.spec.js` — for every viewport in the suite, every destination
in the layout's array must be **reachable by activation**, not merely present:
the test opens the menu the way a visitor does, clicks the link, and asserts the
resulting URL.

It fails when a destination is present but not reachable, which is the exact
state the site is in today. Watch-it-fail is recorded in the commit.

---

## Prevention

| Failure | What now stops it |
|---|---|
| A nav link that renders nowhere at some width | `nav-reach.spec.js` activates every destination at every viewport |
| A file growing past its recorded ceiling | `tests/file-budget.mjs`, run in CI — the prose limit becomes an executable one |
| A second copy of the link list drifting | There is no second copy; both surfaces render one array |
