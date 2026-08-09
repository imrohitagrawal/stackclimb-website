---
name: stackclimb.com — Portrait Plates
description: A portfolio dressed as a series of sapeur portrait plates — flat painted grounds, ruled frames, and captions wired to the thing they name.
colors:
  bone: "#f2ebdd"
  ink: "#16213c"
  ochre: "#c99b3f"
  ochre-dark: "#6b4e14"
  lit: "#f4efe4"
  ground-navy: "#0e1322"
  ground-bordeaux: "#230d13"
  ground-viridian: "#0d231f"
  ground-dusk: "#0e1a23"
  ground-mauve: "#17161a"
  ground-paper: "#e8e2d4"
  surface-navy: "#1a233f"
  surface-bordeaux: "#3f1a25"
  surface-viridian: "#1a3f38"
  surface-dusk: "#1a2f3f"
  surface-mauve: "#2b2930"
  surface-paper: "#d9d2c0"
typography:
  scale:
    caption-label: "0.6rem"
    swatch: "0.62rem"
    ledger-term: "0.64rem"
    colophon: "0.66rem"
    plate-no: "0.68rem"
    brand-em: "0.72rem"
    caption-value: "0.74rem"
    nav-link: "0.76rem"
    button: "0.78rem"
    skip-link: "0.8rem"
    ledger-value: "0.84rem"
    private-note: "0.92rem"
    plate-prose: "1rem"
    body: "1.0625rem"
    lede-max: "1.14rem"
    private-title-max: "2rem"
    headline-tight-min: "2.2rem"
    contact-title-min: "2.8rem"
    contact-title-max: "5.8rem"
    headline-tight-max: "3.8rem"
  display:
    fontFamily: "'Bodoni Moda Variable', 'Bodoni MT', Didot, 'Playfair Display', serif"
    fontSize: "clamp(3rem, 6.8vw, 6rem)"
    fontWeight: 640
    lineHeight: 0.94
    letterSpacing: "0.002em"
  headline:
    fontFamily: "'Bodoni Moda Variable', 'Bodoni MT', Didot, 'Playfair Display', serif"
    fontSize: "clamp(2.6rem, 5.4vw, 5.1rem)"
    fontWeight: 620
    lineHeight: 0.98
    letterSpacing: "0.005em"
  title:
    fontFamily: "'Bodoni Moda Variable', 'Bodoni MT', Didot, 'Playfair Display', serif"
    fontSize: "clamp(1.1rem, 1.8vw, 1.4rem)"
    fontWeight: 460
    lineHeight: 1.4
  body:
    fontFamily: "'Archivo Variable', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Archivo Variable', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.6rem"
    fontWeight: 560
    lineHeight: 1.2
    letterSpacing: "0.2em"
rounded:
  none: "0"
  pill: "999px"
spacing:
  cap-cell: "0.7rem 0.9rem 0.62rem"
  frame-pad: "clamp(1.75rem, 4vw, 4rem)"
  grid-gap: "clamp(2rem, 5vw, 4.5rem)"
  plate-pad-block: "clamp(5.5rem, 11vh, 8rem)"
components:
  button-primary:
    backgroundColor: "{colors.ochre}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.95rem 1.5rem 0.85rem"
  button-primary-hover:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    rounded: "{rounded.none}"
    padding: "0.95rem 1.5rem 0.85rem"
  button-ghost-hover:
    backgroundColor: "{colors.ochre}"
    textColor: "{colors.ink}"
  nav-chip:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
    padding: "0.5rem 1.05rem 0.44rem"
  nav-chip-hover:
    backgroundColor: "{colors.ochre}"
    textColor: "{colors.ink}"
---

# Design System: stackclimb.com — Portrait Plates

## Overview

**Creative North Star: "The Sapeur's Portrait Plate"**

**Amended 2026-08-09 (D49).** The signature of the shipped site is the **artefact
panel** — the one lit surface per plate quoting real recorded system output, dated,
with a file path and commit hash (the Lit-Surface Rule below). Six of seven plates
ship no drawn figure; the panel quietly replaced it, and the dual-agent critique
judged the replacement stronger: *"a quoted refusal beats an illustrated one."* The
drawn-figure-plus-leader-line machinery below remains valid where a figure exists
(the private plate) and for caption strips, but it is no longer the north star —
the artefact is. This paragraph is the record of that supersession; the original
text follows unchanged so its vocabulary still resolves.

Every surface is a numbered plate in a portrait series: a flat painted ground, a
double-ruled frame, a figure at center, and every garment named in a ruled caption.
The figures are the projects, not people — each system is drawn as flat
garment-colored geometry, and the caption strip beneath it bills its facts like a
tailor's ticket (LABEL over VALUE, tracked caps, hairline rules). Captions are wired:
hovering a caption draws an ochre leader line to the exact region of the figure it
names. The page proves rigor by practicing it — the copy register is part of the
system: state what is proven, label what is not, invent nothing (system states like
"Phase 1 — No-Go" and "Gated — unreviewed" appear inside the caption strip as facts,
never as decorative badges).

The world explicitly refuses the two portfolio defaults: no dark-terminal aesthetic,
no white-grid card gallery. *(Correction 2026-08-09: the repaint described next was
removed by DEF-30 — every plate paints its own ground, and 94% of scroll positions
show two plates at once. The sentence is kept for the record.)* Instead the backdrop itself repaints as each plate takes
the easel — the page background cross-fades (0.8s) to that plate's ground hue as it
crosses the middle of the viewport — and a single fixed paint-grain raster
(overlay-blended, opacity 0.5) gives every ground the matte mottle of gouache.

**Key Characteristics:**
- One flat painted ground per plate, tinting a shared grain material
- Double-ruled hairline frames; all rules drawn from `currentColor` at mixed opacity
- Bodoni Moda uppercase display against Archivo tracked-caps labels
- Ochre is the only accent: thread, hover, focus, selection, leader lines
- Facts live in ruled caption strips and dotted ledgers, never in pills or badges
- Copy states what is proven and labels what is not

## Colors

A costume palette: six painted grounds, one paper, one ink, one thread.

### Primary
- **Ochre** (#c99b3f): the thread. The sole accent everywhere — primary button fill, hover underlines, focus outlines, text selection, leader lines and their anchor dots, the tick under each plate number. Small doses; it is stitching, not upholstery.

### Neutral
- **Bone** (#f2ebdd): the cloth. Default text color on dark plates; garment paper inside figures; primary-button hover fill.
- **Ink** (#16213c): the ink. Text color on light plates; text on ochre fills; figure linework and SVG label text. Note: ink (#16213c) is deliberately not the same navy as the ink-navy ground (#1b2440) — one is drawing ink, the other is paint.

### Grounds (one per plate; set via each plate's `data-hue`, repainted onto the page background on scroll)
- **Ink navy** (#1b2440): the default ground; hero (Plate 00) and contact (Plate 06).
- **Bordeaux** (#5e2233): Plate 01.
- **Viridian** (#1e4f46): Plate 02.
- **Dusk blue** (#2e5877): Plate 03.
- **Greyed mauve** (#4a4653): Plate 04.
- **Paper** (#e8e2d4): the one light ground (the private plate, `theme="light"`) — flips text to ink. *Was linen #b5ac9c; upgraded by the value ladder (D18) — the old value was the only ground above L60 at 15% saturation and read as mud.*

### Named Rules
**The Three-Color Livery Rule.** Every plate declares exactly three coordinated colors — Ground, Cloth, Thread — and prints them as its swatch tag. Cloth is bone and Thread is ochre on every plate; only the Ground changes.

**The One Thread Rule.** Ochre is the only accent color in the system. If an element needs emphasis, it gets ochre or it gets nothing; no second accent may be introduced.

**Amendment, 2026-08-09 (D50).** On **lit surfaces only**, verdict chips may use
plate grounds as *semantic ink*: bordeaux (`#5e2233`) for stop states (REFUSED,
NO-GO), viridian (`#1e4f46`) for go states (GO, 52/52 PASSED). The shipped pixels
had already made this move and the critique judged it — palette-internal, works,
and needed: colour-blind-safe because every chip also carries its word. The rule
it amends stays intact everywhere else: on grounds and chrome, ochre or nothing.
A rule the pixels quietly break is drift; this writes it down.

**The Painted Ground Rule.** Grounds are flat hues, never gradients, never photos. Texture comes only from the single shared grain layer (`/paint-grain.webp`, 480px tile, `mix-blend-mode: overlay`, opacity 0.5, fixed) so each plate's hue tints its own paint.

## Typography

**Display Font:** Bodoni Moda Variable (with Bodoni MT, Didot, Playfair Display fallbacks) — self-hosted via @fontsource-variable
**Body Font:** Archivo Variable (with Helvetica Neue, Arial fallbacks) — self-hosted
**Label Font:** Archivo Variable, tracked uppercase

**Character:** High-contrast Didone caps carry the portraiture; a plainspoken grotesque carries the facts. The pairing is a tailor's label: ceremonial name, working measurements.

### Hierarchy
- **Display** (640, clamp(3rem, 6.8vw, 6rem), 0.94): hero h1 only. Uppercase, `text-wrap: balance`, one ochre accent word allowed.
- **Headline** (620, clamp(2.6rem, 5.4vw, 5.1rem), 0.98): plate titles. Uppercase serif; a `.tight` variant (clamp(2.2rem, 4.1vw, 3.8rem)) exists for long names.
- **Title / Pull quote** (460 italic, clamp(1.1rem, 1.8vw, 1.4rem), 1.4): the plate's question, set as an italic serif line faintly warmed toward ochre (`color-mix(currentColor 92%, ochre)`).
- **Body** (400, 1rem, 1.68): plate prose, max 52ch, at 88% of currentColor.
- **Label** (560–640, 0.6–0.78rem, 0.16–0.24em tracking, uppercase): the workhorse register — nav links, caption labels/values, ledger terms, buttons, swatch names, seals, colophon. Letter-spacing rises as size falls.

### Named Rules
**The Caps-or-Prose Rule.** Type is either display/label uppercase or sentence-case body prose. There is no middle register: no title-case headings, no kickers, no eyebrows.

## Layout

The spatial unit is the plate: a full-viewport section (`min-height: 100svh`) that
centers a ruled frame of `min(1240px, 100%)`. Inside the frame, a two-column grid —
copy left (1.05fr, max 34rem), figure right (0.95fr) — with fluid gap
(clamp(2rem, 5vw, 4.5rem)) and fluid frame padding (clamp(1.75rem, 4vw, 4rem)).
The plate tag (Plate Nº + swatch list) sits absolute in the frame's top-right.
Figures are height-capped (56vh desktop, 62vh hero) so figure plus caption strip
stay inside one viewport composition. Variant plates reuse the same frame: the
contact plate collapses to a single centered column; the private plate splits its
copy into a two-card pair.

One breakpoint at 900px: the grid stacks (copy first, figure second), the plate tag
goes static and left-aligned, swatches hide, the caption strip becomes a 2-column
grid, ledger rows stack, and nav links collapse to brand + chip. Spacing is fluid
clamps throughout rather than a fixed step scale.

**The One-Plate-One-Viewport Rule.** Each plate is composed to be seen whole: frame, figure, and caption strip together at 100svh. Content that cannot fit becomes another plate, not a taller one.

## The Value Ladder

**Amended 2026-08-08.** Depth is carried by lightness, not by shadow. Every plate
is built from three steps, and the hue of each plate is unchanged from the original
palette — only lightness moved.

| Step | Lightness | What it is |
|---|---|---|
| `--ground` | L 9.5% | The near-black field the plate is printed on |
| `--surface` | L 17.5% | The raised panel carrying the frame and the copy |
| `--lit` | L 96% | One near-white surface per plate, holding a real artefact |

**Why.** The palette used to sit between L18% and L32% on six of seven plates — a
14-point band — and two thirds of every rendered screen fell inside a 20-point band.
Scrolling changed hue and nothing else, so the page read as printed rather than lit.
The owner called it "dark and dull" and "1980s, 1990s". The hues were never the
problem: they measure 41–47% saturation. A dark interface reads as advanced when it
has a value ladder; this one had a single step.

    bone on ground    was ~7–9:1     now 13.8–15.6:1
    ochre on ground   was 2.97:1     now 6.4–7.25:1     (fixes the focus ring)
    lit on ground     did not exist  now 14.3–16.1:1    (the light source)

**The Lit-Surface Rule.** Exactly one near-white surface per plate, and it must hold
a **real artefact** — actual system output at a size you can read. Never a grey
placeholder bar. A page that promises "AI that shows its work" cannot show a
wireframe where the work belongs.

**The Darkest-Surface Rule.** An accent is measured against the *darkest* surface it
can land on, not the ground. The light plate's accent cleared 4.92:1 on its ground
and still failed at 4.21:1, because the state label sits on the frame surface.
Checking one surface out of three is not checking.

## Elevation & Depth

Flat by doctrine. No box-shadows on any surface at rest; depth is conveyed by the
painted grain material, hairline rules at mixed opacities, and the value ladder above.
The single permitted shadow is interactional: when a caption lights its garment, the
anchored SVG region lifts 4px and casts `drop-shadow(0 10px 18px rgb(0 0 0 / 0.35))`
for the duration of the leader line. It is a spotlight response, never a resting state.

**The Flat-Paint Rule.** Surfaces are flat paint at rest. The only shadow in the system is the drop-shadow on a garment region lit by its caption.

## Shapes

Square-cut everywhere: border-radius 0 on frames, buttons, caption cells, cards, and
ledgers. The two exceptions are the pill nav chip (999px) and small radii inside
figure SVGs (2–4px on drawn paper shapes, which are illustration, not UI). Borders
are 1px hairlines derived from `currentColor` via `color-mix` — strong rules at
50–60%, secondary rules at 22–28% — so every frame and rule automatically recolors
with its plate. The signature silhouette is the double rule: a 1px border plus a 1px
outline offset 6px, framing every plate. Ledgers rule their rows with 1px dotted
lines; the NarraTwin-style honest-absence device in figures is a dashed stroke.

## Components

### Buttons
- **Shape:** square-cut (0 radius), tracked uppercase label (0.78rem, 640, 0.18em)
- **Primary:** ochre fill, ink text, 1px ochre border; padding 0.95rem 1.5rem 0.85rem
- **Hover:** primary fades to bone fill; ghost fills with ochre and flips to ink text (background/color transition 0.25s ease)
- **Ghost:** transparent fill, currentColor text, 1px ochre border

### Chips (nav only)
- **Style:** pill (999px), 1px currentColor border, transparent fill, tracked caps
- **Hover:** ochre fill and border, ink text

### Cards / Containers (the plate frame)
- **Corner Style:** square
- **Background:** none — the frame sits directly on the painted ground
- **Border:** the double rule (1px border at 60% currentColor + 1px outline at 28%, offset 6px)
- **Internal Padding:** clamp(1.75rem, 4vw, 4rem)

### Navigation
- Fixed hairline bar, no background fill; serif small-caps brand with a sans `stackclimb` aside; tracked-caps links (0.76rem, 0.18em) underlined in ochre on hover; recolors bone↔ink with the active plate's theme (0.5s).

### Caption Strip (signature)
- The billing strip under every figure: flex row of ruled cells between 1px top/bottom rules; each cell is LABEL (0.6rem, 62% opacity) over VALUE (0.74rem, 640, uppercase). Cells with a `target` are focusable and draw an ochre leader line (1.5px stroke, dot terminus) from cell to the `data-anchor` region of the figure. System state ("Live — cold-starts", "Phase 1 — No-Go") is a caption cell like any other fact.

### Ledger (signature)
- A `dl` of dotted-ruled rows: tracked-caps term left (0.64rem, 62% opacity), right-aligned value (0.84rem). Used for the career record and contact facts.

### Figures (signature)
- Each project is drawn as a flat SVG figure in the plate's livery: bone paper shapes, ink linework at stepped opacities, ochre functional details (tabs, gates, thread), dashed strokes for honest absence. Every citable region carries a `data-anchor` id matching a caption target. Each figure has a `<title>` and `role="img"`.

## Do's and Don'ts

### Do:
- **Do** give every new plate the Three-Color Livery: a ground hue, bone cloth, ochre thread — declared in its swatch tag and passed as `hue` so the backdrop repaints to it.
- **Do** put every fact — including unflattering state — in a ruled caption cell or ledger row, in the label-over-value register.
- **Do** derive all rules and borders from `currentColor` via `color-mix` so components recolor with the plate theme automatically.
- **Do** wire new figure regions with `data-anchor` ids so captions can draw leader lines to them.
- **Do** keep the copy register: state what is proven, label what is not, invent nothing.

### Don't:
- **Don't** introduce a second accent, a gradient, or a photographic texture; the grain layer is the only material.
- **Don't** use pills or badges for status; state belongs in the caption strip.
- **Don't** round corners on UI surfaces (nav chip excepted) or add resting shadows.
- **Don't** revert to the refused defaults: no dark-terminal styling, no white-grid card gallery, no kickers or eyebrow labels.
- **Don't** draw people; figures are the systems themselves, dressed in the plate's colors.
