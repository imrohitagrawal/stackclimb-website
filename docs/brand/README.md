# Wordmark and mark

> **The owner's candidate marks were compared on 2026-08-09.** Result:
> [`comparison-2026-08-09.md`](comparison-2026-08-09.md). Short version — keep the existing
> wordmark and the RA plate favicon; his logo loses at 16px, both PNGs carry a baked-in
> background rather than transparency, and the mark's orange `#f05020` is a second accent
> against the palette's ochre `#c99b3f`. One lockup is worth pursuing: his logo beside the
> existing Bodoni name, redrawn as SVG in the palette.


**Recommendation, 2026-08-09: do not design a logo. You already have both. Formalise them.**

## Why not a logo

A personal site rarely needs one. **The name is the brand.** An abstract mark next to "Rohit
Agrawal" would be decoration with no job to do — it says nothing the name does not already say,
and it is one more thing to keep consistent across a CV, a LinkedIn banner and an OG image.

What a personal site does need is a **wordmark** (the name, set consistently) and a **small mark**
that survives at 16px in a browser tab. Both already exist here. Neither was written down, which
is why this file exists.

## The wordmark — as shipped

**Corrected 2026-08-11.** This section used to type the domain name as lowercase `stackclimb` in
the site's own Archivo font — a confirmed defect against the owner's actual supplied logo, not
just a plan-draft error. The real wordmark is **"StackClimb"** — capital S, capital C, one word,
in its own distinct rounded sans-serif with an orange accent stroke on the "C" — and it now ships
as a real image asset (`src/assets/wordmark-nav.png`), not retyped text.

    ROHIT AGRAWAL   [StackClimb wordmark image]
    ^^^^^^^^^^^^^   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    Bodoni Moda     the owner's own logo, as supplied — no font
    weight 560      substitution, no recolouring
    1rem
    tracking .14em
    uppercase

Nav order: chevron mark → StackClimb wordmark → "Rohit Agrawal", left to right — logo and its
real wordmark pair first as one unit, the personal name follows. Source of truth:
`src/layouts/Layout.astro` (`.brand` markup) and `src/styles/nav.css` (`.site-nav .brand`,
`.site-nav .wordmark`).

**Fixed, not still open:** the wordmark used to be `display: none` below 900px, so a phone had no
domain identity at all. The image wordmark is visible at every width — this is what closes that
gap, not a separate fix.

## The mark — `public/favicon.svg`

An `RA` monogram inside the plate's own double rule: bone outer, ochre inner, on the plate
ground.

**Why this one is right.** It is not a new invention — it is the site's own signature reduced to
64px. Every plate on the site is a ruled frame on a painted ground with a label in the corner.
The mark is that, with initials. A visitor who has seen the site recognises it; a visitor who has
not still reads a considered object rather than clip-art.

**Changed 2026-08-09:** ground moved from `#1B2440` to `#0e1322`. The old value predated the
value ladder, so the tab icon was painted in a colour the site no longer uses anywhere.

## Still open

| Item | Note |
|---|---|
| ~~`og.png`~~ | **CLOSED 2026-08-30 (D162, RCA-016). The conclusion was right and BOTH stated reasons were false.** *Was:* "1200×630, and **not regenerated since the value ladder**. It shows the old palette and, almost certainly, the deleted mannequin. Anyone sharing a link gets a preview of a site that no longer exists." **Corrections, kept visible because corrections stay.** (1) *The old palette* — false. Measured against the live hero `#top`: `--ground` `#0e1322`, `--surface` `#1a233f`, `--lit` `#f4efe4`. Every colour on the card was the one the site paints today. An earlier draft of this correction called the plate ground stale by comparing it to `#overview`'s `#231e0d` — the WRONG PLATE, and that error is recorded too. (2) *The deleted mannequin* — false, and already refuted once by D153. It is the real photograph. **What was actually wrong**, found by rendering the live hero at 1200×630 and comparing: the card carried a bio, CTA labels reading "WHAT HE BUILT" and "CV" where the site now says "WHAT I BUILT" and "CAREER EVOLUTION" — a third-to-first-person VOICE drift — a single CiteVyn `REFUSED` case where the hero shows a six-row `ENFORCED` practice table, and a `PLATE Nº 00 — THE RECORD` label the built site contains **zero** times. So the last sentence was the true one: a preview of a site that no longer exists. **Fixed by generating the card from the built home page** (`scripts/og-card.mjs`), so the strings on it are the strings in the build by construction. Drift of this class is now impossible and gated by `tests/og-card-contract.spec.js` |

## Protocol — unchanged

Claude produces its own wordmark options **before** opening the owner's folder, or the second
opinion is only a reaction to the first. Candidates go in `assets/inbox/brand/`, which is **not
tracked** — brand files have carried personal contact details as pixels before, and every
text-based secret scanner missed them.

The chosen mark is added deliberately, as a single file, after review.
