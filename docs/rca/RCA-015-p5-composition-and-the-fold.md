# RCA-015 — the honest half of the evidence is the half that falls below the fold

**Status: written before the fix, per AGENTS.md's order, on 2026-08-30.**
**Approval gate: NOT YET APPROVED.** No `src/` file has been touched. W-25 makes the RCA
approval a hard stop, per package, no exceptions.

D153 (the three-page critique) flagged this as P5 ("composition, and the missing surface
briefs") and marked it, alone among the six packages, as **"Needs the owner's input, not just
approval."** That working session happened on 2026-08-30 and all four reserved items were ruled
on. This RCA covers the two that produce code changes.

Every number below was re-measured against **the live site** on 2026-08-30, not copied from
D153. P1–P4 shipped in between and moved them.

## What happened

### 1. `/how-i-build` — the fold cuts the quote at its most important word

The artefact panel holds the single most convincing thing on the page: a real workflow comment
from `deploy-drift-watchdog.yml`. It arrives **fourth**, after the title and three claim bands.

Measured live, `.artefact` bounding box:

| Viewport | Panel top | Panel bottom | Panel height |
|---|---|---|---|
| 1440×768 | 560.8px | **852.9px** | 292.1px |
| 1280×720 | 547.9px | **840.0px** | 292.1px |
| 390×844 | 586.8px | **1088.1px** | 501.3px |

**The bounding box alone would have produced the wrong conclusion, and nearly did.** Read as
"the panel is below the fold" it is false — the panel *opens* above the fold at all three
viewports (560.8 < 768, 547.9 < 720, 586.8 < 844). Measuring the individual text blocks, then
looking at the render, gives the real finding, which is worse and much more specific:

```
1440×768   above  578-659   p: "It fixes the failure mode we hit on #54: main got a new commit…"
           BELOW  672-806   p: "WHAT IT CHECKS (honest scope) […] This is a PROXY […] 34m31s…"
           BELOW  817-835   footer: deploy-drift-watchdog.yml, quorum-ai
390×844    above  606-767   p: "It fixes the failure mode…"
           BELOW  780-1022  p: "WHAT IT CHECKS […] This is a PROXY […]"
           BELOW  1033-1069 footer: deploy-drift-watchdog.yml, quorum-ai
```

Confirmed by screenshot at each viewport with the fold drawn on, per Definition-of-Done item 2
("never report a visual change without looking at the render"):

- **On a phone the fold lands directly on the words "This is a PROXY."** The reader sees the
  watchdog's claim and none of its stated limit.
- On desktop the PROXY sentence survives, but the `34m31s` incident clause and the citation link
  — the two things that make the quote checkable — do not.

The site's whole subject is systems that disclose their own limits. On this page, at the default
phone size, the disclosure is the part that gets cut.

### 2. Where it was introduced, and by what

**By P2 (D156), deliberately, and P2 was right.** The quote used to be a paraphrase: two
non-adjacent lines fused, 12 words dropped with no ellipsis. P2 made it genuinely verbatim, which
**added** the PROXY sentence, the `34m31s` clause and the citation footer. More honest, and
taller — D153 measured the panel bottom at 772px/1440×768; it is now 852.9px.

This is the uncomfortable shape of it: **the accuracy fix is what pushed its own most important
line under the fold.** Nothing here argues P2 should be reversed.

### 3. `/experience` — the argument's conclusion is below the fold on a phone

At 390×844, plate one (`#evolution`) is **1,122.3px** tall against an 844px screen.

- The fold falls **through the Oracle entry** — the current role. Its date range and its line are
  cut.
- The closing sentence sits at **y = 914.6px**, **70.6px** below the fold:
  *"The thread through all six: deciding whether software was safe to release — now applied to AI
  systems deciding that…"*

So a phone reader gets six employers as a bare list, with the sentence that supplies the point of
the list one scroll away. D153 cited 1,075px for the plate; it is now 1,122.3px, because P3's
`.era-org` fix legitimately added a line. Same pattern as above: a correct fix made the fold
problem slightly worse.

### 4. Where it was caught, and why nothing caught it earlier

Caught by D153's critique — **the first critique these three routes have ever had.** Nothing
mechanical was ever going to catch it:

- `geometry.spec.js` asserts boxes against a baseline. Both pages match their baseline. A
  correctly-positioned element that happens to sit below the fold is not a geometry failure.
- The 390px overflow gate (DEF-*) checks `scrollWidth` vs `innerWidth` — horizontal only.
- axe reports **0 violations** on all three routes at both viewports. Reading order below the
  fold is not an accessibility violation.

**The root cause is the one D153 named:** none of the three routes had a surface brief. The pages
were built to a documented design system and then never measured against a stated purpose, so
"what must the reader see first" was never a question anything could fail.

### 5. `/cv` Independent Systems — raised, checked, no change

D153's fourth P5 item asked whether `/cv`'s Independent Systems should stay a disclosure. Checked
live: six entries, three shipped (CiteVyn, Quorum-AI, SaafSaans) and three not (NarraTwin
`Phase 1 — No-Go`, EvalAxis and Aegis Contracts both `In progress — closed`). P1 already fixed
the specific complaint — the NarraTwin card now carries its full context, not a bare failure
line. Ruled by the owner on 2026-08-30: **keep all six as they are.** Closed the way P-24 closed
— raised, checked, kept. No code change.

## The cost

The two most persuasive sentences on the site are the ones a default phone screen hides:
a watchdog admitting what it cannot see, and a fourteen-year career stating its own throughline.
Both are the site's thesis in one line, and both are one scroll past where a reader decides
whether to keep reading.

## The owner's rulings, 2026-08-30

| Item | Ruling |
|---|---|
| `/cv` Independent Systems | **Keep all six as-is.** No change. |
| `/how-i-build` quote | **Keep verbatim, hoist the artefact.** Shortening refused — it would reverse P2's accuracy fix. |
| `/experience` fold | **Lift the closing sentence above the era list, mobile only.** Trimming the era list refused. |
| Surface briefs | **All three visitor modes confirmed** — `/experience` Prove, `/how-i-build` Prove the practice, `/cv` Take away. |

## The proposed fix — needs approval before any of it is written

1. **`/how-i-build`:** move `.artefact` above the three `model-band` blocks in
   `src/pages/how-i-build.astro`. Quote text untouched, byte for byte. Target: the panel's
   first paragraph and the PROXY sentence both above the fold at 390×844.
2. **`/experience`:** move the closing sentence above the era list **at mobile widths only**
   (CSS order, so desktop reading order is unchanged and the DOM order that
   `geometry.spec.js` and the screen-reader flow depend on stays intact).
3. **The three surface briefs** lose their DRAFT flag and record the confirmed visitor mode.
4. **The gate.** Both fixes are fold-position claims, and this repo has no gate that can express
   one — which is exactly why nothing caught it. New assertion: for each route, the named
   element's **bottom** must sit above the viewport height at the stated viewport. Written RED
   first, against the current build, and proved to bite by reverting the reorder.

### What will bite

- **A geometry baseline regeneration is required.** Both routes are in `platedRoutes()` and both
  change visible layout. Runner-side dispatch only — DEF-59's guard refuses a darwin-written
  baseline, and DEF-60's structural floor fires even in update mode.
- **Reordering must not drop a row.** DEF-60 counts structural rows; a reorder that changes child
  counts trips it. Keep the DOM shape, change the order only.
- **The mobile-only lift must not reorder the DOM.** Use CSS ordering, or the accessible reading
  order and the era-list semantics change with it.
- Two adversarial reviewers on the gate change, at least one from a different model family
  (AGENTS.md). Codex is static-analysis-only under `--sandbox read-only` and must be labelled so.

## The check that would falsify this RCA

Reverting the reorder must turn the new fold gate RED at 390×844 on `/how-i-build` and
`/experience`. If it stays green with the reorder removed, the gate asserts nothing and the
finding above is not the finding.
