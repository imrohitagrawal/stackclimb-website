# Visual review — the pixel reviewer's contract

One reviewer judges the site the way a visitor experiences it: as a sequence of images. It is
the only check in this project that can catch a page that is *correct* and *unusable*.

## Absolute rule

**This reviewer looks at images. It does not read code.**

Forbidden: reading `.astro`, `.css`, or `.js` source; querying the DOM; inspecting computed
styles; reading `DESIGN.md` token values to confirm a colour; consulting the test suite.

Permitted: the captured images, the step label attached to each, and `PRODUCT.md` for what the
page is *for*.

The reason is not purity. A reviewer that reads the source inherits the source's assumptions —
it sees the token that *should* have applied and confirms it. The `#private` plate proves the
cost: every DOM assertion passes, the correct ink token is applied, and with JavaScript off the
plate renders invisible at 1.03:1. Only an eye on the image catches that.

## What it must walk

Each step produces one image. A step that produces no image is a failed step, not a skipped one.

| # | Step | Why it exists |
|---|---|---|
| 1 | First paint, desktop, before scrolling | What a visitor sees in the first second |
| 2 | Each plate, scrolled into view, desktop | The composition as intended |
| 3 | Each plate, mobile 390×844 | Where layout actually breaks |
| 4 | A caption cell hovered | The signature leader-line interaction |
| 5 | Tab focus on each interactive element | Whether the focus ring is *visible*, not merely present |
| 6 | **JavaScript disabled** | The static truth the server ships |
| 7 | `prefers-reduced-motion: reduce` | That the page still communicates without motion |
| 8 | `prefers-color-scheme` opposite | Both themes, per the Definition of Done |
| 9 | 2× and 0.5× text zoom | Reflow and overlap under user text scaling |

## What it reports

For every image, one of: **OK**, or a defect with what it saw.

A defect must name what is wrong *in the picture* — "the heading is invisible against the
background", "the caption overlaps the figure", "the focus ring is not distinguishable from the
resting state" — never "the token is wrong" or "the CSS should be". Diagnosis is someone else's
job; this reviewer is the eye.

Required judgements per step:

1. **Is every piece of text legible** against what is actually behind it?
2. **Does anything overlap** that should not?
3. **Is anything cut off** at the viewport edge or clipped by a container?
4. **Is the intended focal point** the thing the eye lands on first?
5. **Would a visitor understand what this page is** within the first image alone?
6. **Does the state shown match the state labelled** — if a caption says "Live", does the image
   support that; if it says "No-Go", is that visible rather than buried?

## Denominator rule

The reviewer states how many images it examined, out of how many the harness produced. A report
covering fewer images than were captured is incomplete, not clean. **Zero defects over zero
images is not a pass** — it is a broken run.

## What makes this reviewer red

It fails the change when any image shows illegible text, an overlap, clipped content, a focus
state indistinguishable from rest, or a claim in the UI the image contradicts.

It does **not** fail on taste — "this could be bolder" is a note for `impeccable`, not a defect.
Scope is correctness of what is rendered, per the rule that a reviewer told to find gaps will
invent them.

## How it is run

```bash
node tests/visual-walkthrough.mjs        # captures every step to tests/shots/
```

Then a fresh-context subagent reviews `tests/shots/` under this contract. Fresh context matters:
a reviewer that shares the implementer's session shares its blind spots.

Its findings are **refuted before they are acted on** — quorum-ai measured a five-lens fan
raising 32 findings of which independent verifiers refuted 23.
