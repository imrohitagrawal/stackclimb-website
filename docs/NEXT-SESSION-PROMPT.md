# Next session — the queue is worked down to what needs the owner

You are continuing work on stackclimb.com, the owner's personal site.
`/Users/rohitagrawal/Projects/designing-website`. Astro, static, Cloudflare Pages.

**DEPLOYMENT IS APPROACH C:** a merge to `main` deploys through CI and verifies production
itself (`gates.yml` deploy job). Never run manual wrangler unless the CI deploy job fails —
break-glass only.

**W-24 (owner, 2026-08-15):** merge each PR autonomously once it is verified and green. That
delegates the MERGE only. It does NOT cover deciding what the site claims about the owner or
his practice — see P-18.

Read first, do not restate back: `AGENTS.md` · `docs/STATUS.md` · `docs/OWNER-DIRECTIVES.md` ·
`PRODUCT.md` · `DESIGN.md`. The ledger is the record; this file only points at it.

## What the previous session did (2026-08-26, five PRs, all merged and deployed)

D128–D133. Four of the six queue items shipped; the other two are recorded decisions that now
wait on the owner. Read the rows, not this list: **D128** (P-1 part 1 + RCA-006), **D129**
(DEF-69, print floor + `tests/print-floor.spec.js`), **D130** (DEF-70, home panel crops +
`tests/panel-scale.spec.js`), **D131** (`htmlparser2`, detector un-degraded), **D132**
(DEF-52 → OWNER ACTION), **D133** (I-4 decided, pending his word).

## Prove the starting state before anything else, and paste the output

```bash
git rev-parse --abbrev-ref HEAD && git rev-list --left-right --count origin/main...main
git status --porcelain | wc -l
node tests/file-budget.mjs && node tests/no-pii.mjs
node tests/geometry-selftest.mjs && node tests/baseline-guard-selftest.mjs
node tests/post-deploy.mjs --self-test
node tests/hook-binding-selftest.mjs
npm run build && npm run post-deploy
gh run list --branch main --limit 1
```

Expected: level with origin, clean tree, all self-tests pass, production green.
**Local Playwright on a Mac will show geometry legs red** — the darwin geometry baseline is
gitignored and stale (DEF-65's shape). Refresh it with
`UPDATE_GEOMETRY=1 npx playwright test tests/geometry.spec.js --workers=1` before reading
any local red as a defect. CI is the truth; the last PR run before this handoff was green.

**Do the skills-currency check in PLANNING, not later.** `npx skills update`, then diff
`skills-lock.json`. Only `computedHash` values moving count — "Updated N skill(s)" is a
per-fetch message. Last session: 51 fetched, **0 hashes moved**. `impeccable` is UNLOCKED and
never appears in that file.

## Update, 2026-08-27 — all three answers below are IN. Do not re-ask.

- **P-1 part 2:** done on his word (D134). `grep -c self-reported PRODUCT.md` → 0; the six stale
  facts refreshed with dated corrections. P-1 is DONE.
- **DEF-52:** he leaves obfuscation on; closed as accepted (D137).
- **I-4:** done (D136) — ten memory folders in one **private** GitHub repo
  (`imrohitagrawal/claude-memory`); push routine in this repo's memory note
  `claude-memory-backup`. Consolidation stays on demand.
- **Also on 08-27:** he overruled D130's panel crops (D135) — CiteVyn shows its whole capture,
  SaafSaans' strip carries the app's header row; `tests/panel-scale.spec.js` no longer holds a
  scale floor. Do not re-crop those panels.

The section that follows is kept as written, for the record of what was asked.

## Three things the owner had to answer — answered 08-27, see above

| # | Item | What is needed from him |
|---|---|---|
| 1 | **P-1 part 2** — the two `self-reported` lines in `PRODUCT.md` (found by content: `grep -n 'self-reported' PRODUCT.md`) | RCA-006 §Open questions carries the four-part ask and the exact proposed wording. One word: apply P-16 as written, or his own wording. Then: is the six-item remaining-debt table in RCA-006 refreshed WITHOUT a re-interview, or held for one? |
| 2 | **DEF-52** | Cloudflare dashboard → Scrape Shield → Email Address Obfuscation → off. Check that closes it: `curl -s https://stackclimb.com/ \| grep -c 'mailto:'` → **2**. Or "leave it on", and the row closes as accepted |
| 3 | **I-4** | Confirm D133's decision (no consolidation pass; reopen at 25 index entries or a wrong memory), and whether the nine other project memory folders get history too |

**Do not start on any of these without his answer.** Each one is either his wording, his
dashboard, or his directive. Raise, then wait; silence is not approval (AGENTS.md, step 4).

## What can be worked without him, in this order, if he has not answered

| # | Item | Notes |
|---|---|---|
| 1 | **DEF-67** — three comment cross-references cite stale line numbers into `visual-baselines.spec.js` | Three one-word edits: drop the numbers, cite the file. Locate by content |
| 2 | **DEF-68** — `plate-height.spec.js` does not cover `/cv` and could not (`section.plate[id]` vs `<article>`) | Needs the selector widened to `.plate[id]` AND a ceiling decision: `/cv` is ~6.9 viewports at 390 against a deepest ceiling of 2.0. Either an EXEMPT entry or a route-shaped ceiling, the way D126 did a route-shaped floor |
| 3 | **DEF-65** — a regeneration refreshes only the tracked platform's baselines; the darwin set goes stale silently | A decision about how a local set is invalidated (a stamp beside the PNGs, a drain step, or delete-on-regenerate). D124 removed the symptom, not the cause |
| 4 | **Standing critique backlog** — the detector's 25 pre-existing findings (D131 lists them by rule) | Candidates, not defects. `Bodoni Fallback` and the value-ladder colours are DESIGN.md's own prose not reflected in its front-matter; the em-dash and hierarchy flags are taste calls under P-18. Decide per rule, record, do not chase |

## Traps this repo keeps re-teaching — three were re-paid last session

1. **Line numbers in the ledger drift.** Locate every site by CONTENT. Re-check any number
   before writing it into the ledger.
2. **`tail` and pipes swallow exit codes.** `node tests/file-budget.mjs | tail -1` let an
   over-budget line get committed AGAIN last session (Corrections table, top row). A gate in
   a script is its own `&&` step with no pipe. Use `--reporter=json` and read `stats`.
3. **`git checkout -- <file>` after a mutation erases uncommitted edits.** It did, last
   session, to the `homeCrop` flags. Commit the GREEN state, THEN mutate.
4. **Astro 7's `astro preview` is single-instance.** A scratch preview on any port makes
   Playwright's own server on 4321 fail with "Process from config.webServer was not able to
   start" — which looks like a Playwright fault and is not. Kill scratch previews before a
   test run.
5. **`codex exec` without a TTY waits on stdin.** Run it with `</dev/null` or it hangs
   silently for the whole time box.
6. **Baseline regeneration shifts every plate by a sub-pixel between runs.** Two dispatches
   on the same build moved the hero by 9.69%. Commit the files whose pixels changed for a
   reason you can name; the rest are noise samples inside the 0.15 net.

## Rules that bind every package

- **Verify before asserting.** Run the cheapest command that settles a question. If you cannot
  verify, say `UNVERIFIED`, name the exact check, and offer it.
- **Done means merged AND verified running in production.** Confirm the deploy JOB ran — not
  `skipped`, not `cancelled`. Compare the CSS hash production serves with a `main` build's.
- **Never hand-generate baselines.** Use `gates.yml`'s `workflow_dispatch`
  (`update_visual_baselines`, `update_geometry_baseline`). A dispatch run SKIPS the test suite,
  so a green dispatch proves nothing — get a normal PR run afterwards. Compare DECODED PIXELS.
- **File budgets are shrink-only.** New modules 250 lines / 32,000 bytes / 120 chars.
- **The ledger is updated in the same change.** Corrections stay. Rejected options carry reasons.
- **One work package, one PR, merged before the next starts.** Merge `main` into the branch
  BEFORE starting work on it.
- **RCA before the fix, as its own commit.** Then the gate RED, then the fix. Every package
  last session followed that order and it is visible in `git log`.

## Close the session properly

`docs/practices/session-close.md` is the protocol. Plain-English summary with NUMBERS · branch
merged and `main` level with origin, proved by command · branch deleted local AND remote ·
everything the session created cleaned up (report "none" rather than skipping the check) · handoff
written. End with `Done` / `Verified myself` / `Cleanup` / `Pending` / `Next action`, and say
explicitly whether work is pushed, merged, and running in production.
