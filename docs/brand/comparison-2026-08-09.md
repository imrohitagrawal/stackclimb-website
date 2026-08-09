# The owner's marks, compared against the existing ones

**Run 2026-08-09.** This is the comparison the handoff asked for and the overnight session
skipped. It is a **comparison, not an installation** — nothing here has been shipped.

The protocol was satisfied before the files were opened: `docs/brand/README.md` recorded Claude's
own recommendation (*"do not design a logo; the name is the brand; a wordmark and an RA plate
monogram already exist"*) on 09 Aug, **before** these PNGs were examined. So this is a second
opinion, not a reaction.

## What was supplied

| File | Size | Format |
|---|---|---|
| `wordmark-light.png` · `wordmark-dark.png` | 815×263 | PNG, alpha channel present |
| `logo-light.png` · `logo-dark.png` | 326×389 | PNG, alpha channel present |

- **The logo** is an interlocking stacked-chevron mark — reads as layers, or a stylised `S` —
  in white with one stroke in orange.
- **The wordmark** is `StackClimb` in a rounded geometric sans, with an orange arc under the `C`.

## Tested at the three sizes that decide it

### 1. Favicon, 16px — **the existing mark wins, clearly**

The RA plate survives: at 16px the double rule and the two letters are still legible, because it
was drawn as a *plate* — a filled ground with high-contrast furniture.

His logo does not survive. The interlocking chevrons collapse into an indistinct grey smudge and
the orange stroke reduces to roughly one pixel. An abstract mark built from repeated parallel
strokes is the hardest kind of thing to hold at favicon size, and this one does not.

### 2. Nav height, 56px — **mixed, and one lockup is genuinely good**

| Option | Verdict |
|---|---|
| Existing: `ROHIT AGRAWAL` Bodoni caps + tracked `stackclimb` | Works. Editorial, matches the plate world |
| His wordmark alone | **Fails.** The rounded geometric sans is the opposite of the site's Didone, and the baked background shows (below) |
| **His logo + the existing Bodoni name** | **The one that works.** At 30px the mark reads as a monogram, and the Bodoni name carries the identity |

### 3. OG card, 1200×630 — **two accents fight**

The existing card is coherent: near-black ground, bone Didone, one ochre word.

With his wordmark added there are **two accent hues on one card** — his orange against the site's
ochre — and neither yields to the other. Nothing about the composition can fix that; it is a
palette conflict, not a layout one.

## Two measured, objective problems

These are not taste. They are facts a command settles.

**1. The "dark" PNGs are not transparent.** Both carry a baked-in opaque background:

```
wordmark-dark  corners rgba(26,35,56,255)   -> BAKED BACKGROUND
logo-dark      corners rgba(26,35,56,255)   -> BAKED BACKGROUND
```

`rgb(26,35,56)` is `#1a2338`. The site's hero ground is **`#0e1322`**. Placed on the plate they
render as a **visibly lighter rectangle** around the mark. The `-light` pair is the same problem
in reverse — corners are opaque white, not transparent.

**2. The accent hue is outside the palette.** Sampled from the mark itself:

```
#f05020  (2303 px)   the dominant non-white, non-ground hue
```

The site's accent is ochre **`#c99b3f`**. That value was not chosen by eye — `palette.css` records
that a first attempt at `#7a5a19` cleared 4.92:1 on the ground and was still caught by axe at
4.21:1 on the frame surface, so the current value is the one that passes AA against **all three**
light surfaces. Introducing `#f05020` means either a second accent, or re-deriving the whole
value ladder and re-checking every contrast pair.

## Recommendation

**Keep the existing wordmark and the RA plate favicon. Adopt nothing as-is.**

**Worth pursuing, if he wants a mark:** the *logo + existing Bodoni name* lockup at nav height was
the one combination that read well. To ship it needs three things, none of them cosmetic:

1. **Redrawn as SVG.** PNG is a raster format; the nav and favicon need vector. `docs/brand/README.md`
   already says this.
2. **Recoloured to the palette** — bone `#f2ebdd` with the ochre `#c99b3f` accent, not `#f05020`.
   Then re-measured against ground, surface and lit, the way the accent originally was.
3. **True transparency**, so it sits on the plate rather than on a rectangle of its own.

**What it would still not solve:** the favicon. Even redrawn, the chevron mark loses at 16px, and
the RA plate does not. There is no rule that says the favicon and the nav mark must be the same
drawing — many identities use a monogram at favicon size and a fuller lockup elsewhere.

## The honest counter-argument

`docs/brand/README.md` argues a personal site does not need a logo at all: the name is the brand,
and an abstract mark beside "Rohit Agrawal" is decoration with no job. **Nothing in this
comparison refutes that.** The logo+name lockup is *better than the alternatives tested*, which is
not the same as *better than no logo*. That remains the owner's call, and it is a preference, not
a measurement — which is exactly why the two measured problems above are separated from the
judgement.

## Still open, and unrelated to which mark wins

`.site-nav .brand em` is `display: none` below 900px, so **on a phone the site shows no domain
identity at all.** Recorded in `README.md`, still unfixed, and now compounded by DEF-42 — below
900px the nav also drops every link except the email chip.
