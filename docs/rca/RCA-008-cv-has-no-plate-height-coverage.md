# RCA-008 — `/cv` has no plate-height coverage, and closing that needs three decisions, not one

**Status: written before the fix, per the AGENTS.md order, on 2026-08-27.**

DEF-68's row names two moves: widen the selector, then choose a ceiling. Measuring the route
first turned up a **third** blocker sitting between them, and put a number on the second that
the row never had.

## What happened

`tests/plate-height.spec.js` gates every route `siteRoutes()` returns. `/cv` is deliberately
not in that list (D126's Rejected row: five files consume it, and `type-floor.spec.js` would
run `/cv` twice). So `/cv` has geometry coverage and type-floor coverage and **no plate-height
coverage**, and nothing said so until DEF-68's row.

Adding the route does not fix it. Three separate things block it.

## The three blockers, each measured on the `7d119b9` build

**1. The selector cannot see the plate.** The spec queries `section.plate[id]`. `/cv`'s plate
is `<article class="cv plate" id="cv">`. Measured on the built page: `section.plate[id]` → **0**,
`.plate[id]` → **1**. This is trap 9 exactly — a `<section>`-scoped query missing an `<article>`.

Widening to `.plate[id]` — which `geometry-measure.mjs` and `palette-ladder.spec.js` already
use — is **provably neutral on every route the gate covers today**. Measured at both widths on
all seven:

| Route | `section.plate[id]` | `.plate[id]` |
|---|---|---|
| `/` | 9 | 9 |
| `/projects/citevyn` · `quorum` · `saafsaans` · `narratwin` | 3 | 3 |
| `/experience` | 2 | 2 |
| `/how-i-build` | 3 | 3 |
| **`/cv`** | **0** | **1** |

Identical at 390×844 and 1440×900. The widening changes exactly one thing: `/cv` gains its plate.

**2. The partner assertion rejects a one-plate route. DEF-68's row does not mention this.**
The floor is `route === '/' ? 4 : 1`, asserted with `toBeGreaterThan(floor)` — so a non-home
route must carry **at least two** plates. `/cv` carries one. Widening the selector therefore
moves `/cv` from "finds nothing" to "found one, and one is not enough": still red, for a new
reason. The floor has to become route-shaped too, the way D126 made the geometry floor
route-shaped, and it must stay a real floor — a floor of 0 would certify sameness rather than
coverage, which `geometry-selftest.mjs` already has a named check against.

**3. The ceiling. Measured at both widths, where the row measured one.**

| | `/cv` measured | The file's deepest ceiling | Over by |
|---|---|---|---|
| 390 × 844 | **5835px = 6.91 viewports** | 2.00 | 3.5× |
| 1440 × 900 | **3884px = 4.32 viewports** | 1.10 | 3.9× |

DEF-68's row records 5845px at 390. Today's build measures **5835px** — a 10px difference from
an unrelated change since the row was written. The desktop figure was never taken; it is the
worse of the two relative to its ceiling.

## The bite proof for blocker 1, run rather than reasoned

The widening is neutral today, so "neutral" could be read as "pointless". It is not. The old
selector lets a real ceiling violation through the moment a plate changes tag — which is not
hypothetical, because `/cv`'s plate is already an `<article>`.

Demonstrated on an isolated copy (`git archive HEAD | tar -x`, so the working tree was never
mutated — traps 3 and 4 avoided by construction), with two mutations:

1. `Plate.astro` renders `#citevyn-record` as `<article class="plate" id>`; every other plate
   stays a `<section>`. A **partial** retag, because a total one would trip the partner
   assertion and go red honestly.
2. That plate is pushed to `min-height: 2200px` — over the mobile ceiling of 2.00 and the
   desktop ceiling of 1.10.

Same build, same command, only the selector differs:

| Selector | Result |
|---|---|
| `section.plate[id]` — today's | **28 passed, 0 failed.** A 2200px plate is invisible to it |
| `.plate[id]` — the fix | **24 passed, 4 failed:** *"#citevyn-record is 2200px — 2.61 viewports at 390×844, ceiling 2"* and *"2.44 viewports at 1440×900, ceiling 1.1"* |

That is the answer to "which change turns it red", and it is recorded in the spec's header in
the same commit.

## Where it was introduced

At the **design stage of the gate**, on the day it shipped. The spec scoped itself to
`section.plate[id]` when every plate in existence was a `<section>`. `/cv`'s `<article>` came
later. Nothing connected the two, because nothing was watching the route at all.

## Where it was caught

While shipping D126 — by a person adding `/cv` to a *different* gate and noticing this one had
never had it. Not by a gate. There is no gate that notices a route is ungated; `geometry-selftest.mjs`
has one for its own floors ("a new route with no floor is caught by the audit") and
`plate-height.spec.js` has no equivalent.

## Cost

Zero so far — `/cv` has not regressed. What it becomes if left: the CV is the one page a
recruiter is most likely to open on a phone, it is **6.91 viewports** of continuous scroll
there, and the gate that exists to catch exactly that has never looked at it. A page can double
in length with every gate green.

## The fix, split by who owns each part

**Mine, and shipped in this change:** blocker 1 — widen the selector. Provably neutral on every
route gated today, and proved above to close a real hole.

**Held, because it is only needed for `/cv`:** blocker 2. A route-shaped partner floor with no
`/cv` to apply it to is a mechanism without a consumer. It ships with the route, when the route
is approved.

**His:** blocker 3. The ceiling is not a number, it is a rule change.

## Open question for the owner — what should `/cv`'s ceiling say

**The ask.** `/cv` is one plate 6.91 viewports tall on a phone. What should the gate assert
about it: nothing, or a growth ratchet?

**The current behaviour, from the real artifact.** The One-Plate-One-Viewport Rule in
`DESIGN.md` — *"Content that cannot fit becomes another plate, not a taller one"* — is written
without qualification. `plate-height.spec.js` already carries one amendment to it: two ceilings,
home at 1.00/1.75 and deeper routes at 1.10/2.00, and the file's own header says that split
"IS A DESIGN-SYSTEM AMENDMENT AND NEEDS THE OWNER'S SIGN-OFF". A `/cv` ceiling is a **third**
tier on the same rule. That is why it is not being written without you.

**The suggestion, and the behaviour after it.** A route-shaped ceiling of **7.30 at 390 and
4.55 at 1440** — the measured height plus a 5% margin, the same margin the other three ceilings
carry. It does not pretend the design rule is met on `/cv`; it stops the page growing. If the CV
gains a section and crosses it, the gate goes red and you decide whether the page splits or the
number moves. The alternative is an `EXEMPT` entry for `#cv`, which is honest but leaves the
height assertion measuring nothing on that route — the two partner assertions (a plate exists,
and it painted) would still bite.

**Where your input is and is not needed.** Blockers 1 and 2 are mechanical and are being fixed
either way. The choice is only between the ratchet and the exemption, and, if the ratchet, whether
7.30/4.55 is the right pair or you want it tighter. An everyday version of the choice: a doorway
too low for the rule either gets marked *"mind your head, and it may not get lower"* — the ratchet —
or gets a sign saying *"this doorway is not measured"* — the exemption. Both are honest. Only one
notices if someone lowers it further.

Silence is not approval. Blocker 1 ships; blocker 2 and the route wait for your answer.

## Answered — the owner ruled on 2026-08-27 (D142)

**His words: "for /cv 'ratchet'"**, and then, on the sequencing: **"Keep the ratchet at the
current. Do not minimize it."**

**Ceilings, from the measurements above plus the 5% margin the other three carry:**
`7.30` at 390×844 and `4.55` at 1440×900. Blocker 2 is closed with them — the partner floor is
now route-shaped (`/` 5, `/cv` 1, everything else 2, asserted with `>=`), which is what admits a
one-plate route without admitting an empty one.

**The slack, recorded because it is deliberate.** I recommended setting the ratchet *after* the
three approved shortening changes land — a section index, a collapsible Technical block, and
four condensed roles, together worth roughly 1.4 viewports — so the ceiling would not be baked
in for a page that no longer exists. He overruled that: the ratchet stays at today's height. The
consequence, stated rather than discovered later: once those land, this ceiling carries about
**1.8 viewports of slack at 390** and will not catch a regression smaller than that. Raised
before it was set; his call; written into the spec's own header as well as here.

**Proved in both directions, run rather than reasoned:**

| | Result |
|---|---|
| Before, `/cv` added with nothing else changed | **4 failures — *"no plates found — this test would be measuring nothing"*.** Blocker 2, exactly as predicted above |
| After, real tree | **32 passed, 0 failed** — up from 28, because `/cv` adds two widths × two projects |
| Ratchet bites, on an isolated copy with `#cv { min-height: 6800px }` | **4 failures:** *"/cv #cv is 6800px — 8.06 viewports at 390×844, ceiling 7.3"* and *"7.56 viewports at 1440×900, ceiling 4.55"* |

`geometryRoutes()` was renamed `platedRoutes()` in the same package: the list is "every route
that renders plates", and a height gate importing something called *geometryRoutes* would have
been a name that lies — the class DEF-64 and DEF-67 are both about.
