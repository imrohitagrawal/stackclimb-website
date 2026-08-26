# RCA-007 — line numbers written into comments, and how many of them are already wrong

**Status: written before the fix, per the AGENTS.md order, on 2026-08-27.**

DEF-67 is scoped to three comment cross-references into `tests/visual-baselines.spec.js`.
Before touching them the population was enumerated, because AGENTS.md forbids generalising
from one unrepresentative sample. The three are real. They are also **3 of 24**.

This document records the measurement, fixes DEF-67 as scoped, and raises the scope of the
remaining 21 rather than expanding the package without saying so.

## What happened

A comment that cites `file.ext:NN` is a claim about a line number in another file. Nothing
updates it when that other file changes. Every edit anywhere in the repo silently rots an
unknown number of these pointers, and nothing fails when one rots.

DEF-64 already taught this once. DEF-67 is the same lesson arriving a second time, which is
why this RCA measures the class instead of patching the instance.

## The measurement

Method, reproducible: enumerate every `basename.ext:NN` citation in tracked `src/`, `tests/`
and `scripts/` source, resolve each basename against `git ls-files`, read the line it points
at, and compare that line with what the citing comment says is there. Vendored `.agents/`
skill trees are excluded — they are not this repo's prose.

Measured on `5615a81`, 2026-08-27:

| | Count |
|---|---|
| Citations found | **43** |
| Resolvable to a tracked file | **42** (`expect.js:12486` points into installed Playwright source, and the comment says so) |
| **Cited line does not carry the claimed content** | **24** |
| Cited line carries it, or points inside the quoted sentence | 18 |

**57% of this repo's line-number citations are wrong.** Not drifting — already wrong, today,
on `main`, before this package changed anything.

The 24, each verified by locating the claimed content with `grep -n`:

| Citing site | Cites | Claimed content actually at |
|---|---|---|
| `src/components/SystemPlate.astro` (the split rule) | `DESIGN.md:228` | 249 |
| `src/pages/projects/[slug].astro` (THREE PLATES) | `DESIGN.md:228` | 249 |
| `tests/plate-height.spec.js` (WHY THIS EXISTS) | `DESIGN.md:228` | 249 |
| `tests/plate-height.spec.js` (written without qualification) | `DESIGN.md:228` | 249 |
| `src/styles/avatar.css` (one-plate-one-viewport) | `DESIGN.md:199` | 249 |
| `src/styles/systems.css` (never in a pill) | `DESIGN.md:354` | 164 |
| `tests/plate-height.spec.js` (two-minute skim) | `PRODUCT.md:190` | 206 |
| `src/styles/cv.css` (paint-grain layer) | `global.css:34` | 47 |
| `src/styles/print.css` (`.links` is a flex row) | `global.css:188` | 176 |
| `src/styles/print.css` (external-link `::after`) | `global.css:201` | 206 |
| `src/styles/motion.css` (the entrance curve) | `nav.css:130` | 160 — the cited line is blank |
| `tests/experience.spec.js` (entrance start value) | `motion.css:72` | 81 |
| `tests/how-i-build.spec.js` (entrance start value) | `motion.css:72` | 81 |
| `tests/geometry-selftest.mjs` (the no-browser idiom) | `file-budget.mjs:95` | cited line is a bare `}` |
| `tests/lib/geometry-compare.mjs` (the `audit(files, read)` seam) | `file-budget.mjs:61` | 63 |
| `tests/lib/geometry-floor.mjs` (the same seam) | `file-budget.mjs:61` | 63 |
| `tests/lib/geometry-baseline-io.mjs` (never trim the comments) | `file-budget.mjs:120` | cited line is code, not the rule |
| `tests/lib/geometry-floor.mjs` (route-shaped floors) | `type-floor.spec.js:77` | 78 |
| `tests/print-floor.spec.js` (same reasoning, same numbers) | `type-floor.spec.js:77` | 78 |
| `tests/lib/geometry-floor.mjs` (route-shaped like plate-height) | `plate-height.spec.js:80` | cited line is a bare `);` |
| `tests/type-floor.spec.js` (route-shaped like plate-height) | `plate-height.spec.js:80` | cited line is a bare `);` |
| `tests/geometry.spec.js` (the gate's stated job) | `visual-baselines.spec.js:24` | 38 — **DEF-67** |
| `tests/lib/geometry-measure.mjs` (the `.plate[id]` selector) | `visual-baselines.spec.js:62` | 195/200 — **DEF-67** |
| `tests/lib/geometry-measure.mjs` (one of the three things) | `visual-baselines.spec.js:24` | 38 — **DEF-67** |

A fourth stale pointer to the same target sits in prose: `docs/plan/geometry-gate.md` cites
`tests/visual-baselines.spec.js:24` in an evidence table. It is a historical planning record
and is **not** edited here; editing a plan after the fact rewrites the record rather than
correcting it.

## Where it was introduced

At the **writing stage**, continuously, by everyone — including every prior package in this
repo. There is no single commit to name. The comments were accurate when written; the rot is
caused by unrelated edits to the cited file, which is exactly why no author ever sees it.

## Where it was caught

By reading, twice. DEF-64 caught one instance. DEF-67 caught three more while shipping D124.
Neither was caught by a gate, because no gate exists for it. Both were found only because a
person followed a pointer and landed on unrelated text.

## Cost

A reader following a pointer lands on unrelated text and may conclude the quoted sentence was
deleted. On a repo whose whole subject is systems that disclose their own limits, a citation
that silently lies is worse than no citation — it spends the reader's trust and returns
nothing. The concrete cost so far: two defect rows, two packages, and this document.

## The fix

**For DEF-67's three, in this change:** drop the number, keep the filename. A filename cannot
go stale while the file exists, and the sentence beside it already says what to look for. The
same one-word edit each time.

Before / after, `tests/geometry.spec.js`:

```
- * WHY. visual-baselines.spec.js:24 states its own job as "the nav's layout
+ * WHY. visual-baselines.spec.js states its own job as "the nav's layout
```

**For the other 21, and for stopping the class:** raised below, not done here.

## Open question for the owner — the scope of the sweep

**The ask.** DEF-67's three are fixed in this change. Should the other 21 be swept in a
package of their own, with a gate that stops new ones landing?

**The current behaviour, from the real artifact.** On `main` at `5615a81`, 24 of 42
line-number citations point at the wrong line. Nothing detects this. Fixing DEF-67's three
leaves 21 live and leaves the cause untouched, so the three fixed today are the only ones that
stay correct — and only until someone writes the next one.

**The suggestion, and the behaviour after it.** One package: the same one-word edit applied to
all 21, plus `tests/cite-audit.mjs` — a gate that fails when a comment in `src/` or `tests/`
writes `file.ext:NN`. Citing the file stays legal; citing a line stops being possible. It runs
without a browser, self-tests both directions like every other gate here, and after it the
count is 0 and cannot climb. AGENTS.md's own rule is that a budget must be executable, "not by
prose" — this is that rule applied to citations.

**Where your input is and is not needed.** The sweep is mechanical and needs no ruling. The
*gate* does: it bans a habit every file in this repo currently uses, including files you have
read and approved, and a reviewer could reasonably call a line number a useful convenience
rather than a defect. Two open sub-questions if you want the gate: whether `docs/` prose is in
scope (it carries the same rot — `docs/plan/geometry-gate.md` proves it), and whether existing
accurate citations are grandfathered or swept too.

Silence is not approval. Nothing beyond DEF-67's three is changed until you answer.
