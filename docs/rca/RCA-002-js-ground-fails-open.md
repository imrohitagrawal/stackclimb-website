# RCA-002 — The DEF-1 fix fails open, and DEF-1 was recorded as fixed

**Status:** AWAITING APPROVAL. No code changed.
**Severity:** High — the original defect returns in full, and nothing detects it.
**Found by:** the architect/developer plan review, by executing. Not by reading.

---

## What I claimed, and what is true

`docs/STATUS.md:113` records DEF-1 as **FIXED**, on the strength of one check: JavaScript off,
plate paints its own linen ground, 7.1:1. That check was real. It was also **half the problem.**

The reviewer tested a third state I never considered: **JavaScript on, but `plates.js` dead.**

```
pageerror: IntersectionObserver is not defined
htmlClass: js-ground      plateBg: rgba(0,0,0,0)     plateColor: rgb(22,33,60)
#private color-contrast violating nodes: 14
sample ratio: 1.03  fg #17213d  bg #1b2440
```

**1.03:1. Fourteen nodes. The exact original defect, back in full.**

## Why it happens — the fix fails open

The repair split responsibility across two scripts that fail independently:

| Script | Where | Can it fail? |
|---|---|---|
| Inline, adds `.js-ground` | `Layout.astro:26` | Practically never. One statement, no dependencies |
| `plates.js`, repaints `--bg` | `src/scripts/plates.js:14-28` | Yes. One module, no `try/catch`. Any early throw kills it |

So `.js-ground` says *"JavaScript is available, plates may go transparent."* It does **not** say
*"the thing that repaints the background is running."* When the module throws, plates are
transparent and nothing paints. Ink text on ink navy.

**The analogy:** it is a relay race where the first runner drops the baton at the handover and
keeps celebrating. The class is a promise that the next runner will start, not a receipt that
they did.

A throw at `plates.js:14` also silently kills the leader lines (`:113-121`) and the deep-link
handler (`:98-111`) — one module, no isolation.

## Where introduced, where caught

- **Introduced:** in the DEF-1 fix itself, this session. I created it.
- **Caught:** by a reviewer told to execute rather than read.
- **Not caught by:** the a11y suite, which always runs with working JS. Nor the visual
  walkthrough, which only tests `javaScriptEnabled: false` (`visual-walkthrough.mjs:107`).
  **There is no "JS on, module dead" lens anywhere in the project.**

## Cost

Nothing shipped, so zero so far. The cost avoided is larger than the original defect's: DEF-1 was
recorded closed, and a closed defect stops being looked at.

## The fix

One line moves, and the meaning changes completely.

**Now:** `Layout.astro` adds `js-ground` before `plates.js` runs.
**Instead:** `plates.js` adds it as its **last** statement, after the observer is attached.

The class becomes a **receipt that the repainter is running**, not a promise that it will. If the
module throws, the class never lands, plates keep their own grounds, and the page is correct —
just without the cross-fade. It fails closed.

Cost of the flash this reintroduces: one frame at most, and only when JS is slow. Correct-and-
briefly-plain beats fast-and-invisible.

## What must also be built

The reviewer's deeper point: **no test can see this today.** The fix is worth little without the
lens that would have caught it.

- Add a third state to the walkthrough: JS enabled, `plates.js` forced to throw.
- Add it to the a11y suite too — the contrast check must run in the degraded state.

Without that, this exact class of defect recurs and nothing notices.

## Open question

Should `plates.js` also wrap its three concerns — repaint, leader lines, deep links — so one
throwing does not kill the others? My view: yes, but as a separate change. Bundling it here
would hide the one-line fix inside a refactor.

## Decision

**Not approved. Nothing changed.**

---

## Superseded 2026-08-09 — the mechanism described here was refuted

**Do not implement the fix below.** It is a no-op.

`.js-ground` gated exactly one CSS rule, `.js-ground .plate { background: transparent }`, and
commit `75ea9a7` — the DEF-30 fix, 2026-08-08 — deleted that rule. From that moment the class had
no consumer, so there was nothing for it to fail open *into*. Verified before acting:
`grep -c js-ground dist/_astro/*.css` returns **0**.

This RCA's proposed one-line change (set the class from `plates.js` instead of the head) would
therefore have changed nothing, and the "flash" it weighs as the cost of that change cannot occur.
The inline script has now simply been deleted.

**The document is kept, not removed, because the reasoning was sound and the conclusion was
overtaken by a fix landing elsewhere.** That is the ordinary way a defect record goes stale, and
this repo's own Corrections table already records that a right answer from a wrong proof is still
a wrong proof.

**What was actually wrong is in [`RCA-003-nav-has-no-ground.md`](RCA-003-nav-has-no-ground.md)**,
and it is larger: the fixed nav had no ground of its own and was below AA at 46% of desktop scroll
positions, worst 1.00:1, on the live site — while all three of the site's contrast gates reported
green, because none of them could see it.
