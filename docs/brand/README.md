# Wordmark and mark

**Recommendation, 2026-08-09: do not design a logo. You already have both. Formalise them.**

## Why not a logo

A personal site rarely needs one. **The name is the brand.** An abstract mark next to "Rohit
Agrawal" would be decoration with no job to do — it says nothing the name does not already say,
and it is one more thing to keep consistent across a CV, a LinkedIn banner and an OG image.

What a personal site does need is a **wordmark** (the name, set consistently) and a **small mark**
that survives at 16px in a browser tab. Both already exist here. Neither was written down, which
is why this file exists.

## The wordmark — as shipped

    ROHIT AGRAWAL   stackclimb
    ^^^^^^^^^^^^^   ^^^^^^^^^^
    Bodoni Moda     Archivo
    weight 560      weight 500
    1rem            0.72rem
    tracking .14em  tracking .22em
    uppercase       lowercase, 55% opacity

Source of truth: `src/styles/global.css`, `.site-nav .brand` and `.site-nav .brand em`.

**Open defect:** `.site-nav .brand em` is `display: none` below 900px, so **on a phone the site
has no domain identity at all**. Raised in the design critique, still unfixed.

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
| `og.png` | 1200×630, and **not regenerated since the value ladder**. It shows the old palette and, almost certainly, the deleted mannequin. Anyone sharing a link gets a preview of a site that no longer exists |
| Mobile wordmark | `stackclimb` is hidden below 900px |
| Owner's own candidates | Not yet supplied. Protocol below still applies |

## Protocol — unchanged

Claude produces its own wordmark options **before** opening the owner's folder, or the second
opinion is only a reaction to the first. Candidates go in `assets/inbox/brand/`, which is **not
tracked** — brand files have carried personal contact details as pixels before, and every
text-based secret scanner missed them.

The chosen mark is added deliberately, as a single file, after review.
