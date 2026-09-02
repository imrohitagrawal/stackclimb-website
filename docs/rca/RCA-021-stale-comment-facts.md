# RCA-021 — two stale FACTS in code comments (DEF-78)

## What happened

Two code comments state facts about the codebase that are no longer true:

1. `src/styles/systems.css:9` and `src/styles/project.css:4` both say `global.css` "stands at
   451 lines against a grandfathered ceiling of 500." Verified: `wc -l < src/styles/global.css`
   returns **500** — the file now sits exactly at its grandfathered ceiling, with zero headroom,
   not 49 lines under it.
2. `tests/print-floor.spec.js:75` says its element-floor reasoning uses "the same numbers" as
   `tests/type-floor.spec.js`. Verified by reading both `minTextOwners` functions: they agree on
   `/` (100) and every other route (20), but differ on `/404` — print-floor uses **3**,
   type-floor uses **5**. `print-floor.spec.js:81-83` already explains the `/404` difference
   correctly in the sentence right after the false "same numbers" claim, so the two sentences
   in the same comment block contradict each other.

## Where introduced

Both predate this run. `global.css` grew from 451 to 500 lines at some point after the
`systems.css`/`project.css` comments were written, without those comments being updated. The
`print-floor.spec.js` "same numbers" line was written broadly (true for every route but one) and
never narrowed once the `/404` exception was added three lines later in the same block.

## Where caught

Filed as `docs/STATUS.md` row `DEF-78` during the D165/DEF-71 citation-pointer sweep, which
touched these same files for a different defect class (stale `file.ext:NN` pointers) and a
cross-model reviewer flagged these two facts as also wrong, but out of scope for that sweep.
Not caught by any gate: `tests/cite-audit.mjs` (backing the citation gate) checks that a cited
`file.ext:NN` pointer resolves to a real line — it is a pointer-form check, not a truth check,
and neither of these two comments is a `file:line` citation at all.

## Cost

Low. Both are comments, not rendered output or test assertions — a reader trusting either
comment gets a wrong number, but no build, gate, or shipped page is affected.

## Corrected wording

1. `systems.css` / `project.css`: "global.css, which stands at 500 lines — its grandfathered
   ceiling exactly, with zero headroom."
2. `print-floor.spec.js`: replace the false "same numbers" claim with a statement that the two
   floors agree everywhere except `/404` (print 3, type 5), pointing at the existing explanation
   three lines below instead of duplicating or contradicting it.

## What will bite if this is not fixed

Nothing structural — this is a low-severity documentation-accuracy fix. Left alone, a future
reader trusts the wrong line count for `global.css`'s remaining budget (there is none) or
believes the two floor files are more identical than they are.
