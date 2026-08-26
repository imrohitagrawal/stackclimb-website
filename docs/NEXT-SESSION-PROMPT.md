# Next session — the queue is empty; four questions wait on the owner

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

## What the previous session did (2026-08-27, four PRs, all merged and deployed)

D138–D141. **The whole four-item queue is worked down.** Read the rows, not this list:
**D138** (DEF-67 + DEF-71 filed), **D139** (DEF-68 blocker 1), **D140** (DEF-65 fixed),
**D141** (the critique backlog decided, one record per rule).

Three of the four packages found the recorded scope was wrong and said so before acting:
DEF-67's "three" was 24, DEF-68's two blockers were three, and DEF-65's one lie was two.

## Prove the starting state before anything else, and paste the output

```bash
git rev-parse --abbrev-ref HEAD && git rev-list --left-right --count origin/main...main
git status --porcelain | wc -l
node tests/file-budget.mjs && node tests/no-pii.mjs
node tests/geometry-selftest.mjs && node tests/baseline-guard-selftest.mjs
node tests/baseline-stamp-selftest.mjs
node tests/post-deploy.mjs --self-test && node tests/hook-binding-selftest.mjs
npm run build && npm run post-deploy
gh run list --branch main --limit 1
```

Expected: level with origin, clean tree, all **seven** self-tests pass, production green.

**The local suite on a Mac is now GREEN — 511 passed, 0 failed, 3 skipped.** The paragraph
that used to live here warning you that six geometry legs go red locally is gone, because
DEF-65 fixed the cause (D140). If your local baseline set IS behind, the run now says so
itself and prints the one command that repairs it. Do not go looking for a prose warning.

**Do the skills-currency check in PLANNING, not later.** `npx skills update`, then diff
`skills-lock.json`. Only `computedHash` values moving count — "Updated N skill(s)" is a
per-fetch message. `impeccable` is UNLOCKED and never appears in that file.

## The four questions waiting on him — raise, then wait. Silence is not approval

Each is written out in the four-part shape in the document named. Do not start any of them
without his answer.

| # | Question | Where it is written |
|---|---|---|
| 1 | **DEF-71** — sweep the other 21 stale `file:line` citations, and add a gate that bans writing a line number into a comment at all? Two sub-questions ride on it: is `docs/` prose in scope (303 citations there, only 3 audited), and are accurate citations grandfathered? | `docs/rca/RCA-007-line-numbers-in-comments.md` §Open question |
| 2 | **DEF-68 blocker 3** — what should `/cv`'s plate-height ceiling say? It is **6.91 viewports at 390** and **4.32 at 1440**, against deepest ceilings of 2.00 and 1.10. A growth ratchet at 7.30/4.55, or an `EXEMPT` entry? It is a third tier on an unqualified `DESIGN.md` rule, and `plate-height.spec.js`'s own header says that split needs his sign-off | `docs/rca/RCA-008-cv-has-no-plate-height-coverage.md` §Open question |
| 3 | **The em-dash count** — 40 in body copy on `/`, 34 on `/cv`. Real counts, not artefacts. It is the site's voice, so P-18 reserves it | `docs/decisions/critique-backlog.md` Record 4 |
| 4 | **DEF-68 blocker 2** — rides with question 2. The partner floor needs a route-shaped value only once `/cv` is actually in the gate | same as 2 |

## What can be worked without him, in this order

| # | Item | Notes |
|---|---|---|
| 1 | **D141 Record 2** — add `Bodoni Fallback` to `DESIGN.md`'s `typography` front-matter | One line. The prose at `DESIGN.md:204` already describes it; the front-matter, which is the half the detector reads, never listed it. No pixels move |
| 2 | **D141 Record 3(a)** — add the eight missing ground/surface/lit values to `DESIGN.md`'s colour front-matter | The front-matter lists six ground/surface pairs; `palette.css` declares ten. Locate by content in `src/styles/palette.css`. No pixels move |
| 3 | **D141 Record 3(b)** — `#7a2318`, hard-coded three times at `hero-practice.css:72` | A genuine leak: not a token, in no document. Give it a token and name it, or replace it with an existing one. **The colour it renders is a claim about the design system, so which of those two is a presentation call — decide it, build it, and show him the RENDER, not an option list** |
| 4 | **The queue is empty** | Stop. Write the handoff, close the session, and say so. Do not invent work |

## Traps this repo keeps re-teaching

1. **Line numbers in prose go stale.** 24 of 42 in code were already wrong; 303 more sit in
   `docs/`. Locate every site by CONTENT.
2. **`tail` and pipes swallow exit codes.** In zsh it is `$pipestatus[1]`, not `$PIPESTATUS[0]` —
   that cost a silent empty exit code this session. Make a gate its own `&&` step with no pipe,
   or use `--reporter=json` and read `stats`.
3. **`git checkout -- <file>` erases uncommitted edits.** Commit GREEN, then mutate. Better
   still: mutate a COPY — `git archive HEAD | tar -x -C <dir>` never touches your tree, and it
   is what made both mutation proofs this session safe by construction.
4. **A mutation run leaves a mutated `dist/`.** Rebuild before any screenshot or probe.
5. **`astro preview` is single-instance.** Kill scratch previews (`lsof -tiTCP:4321`) before any
   test run; the error blames Playwright and is not Playwright.
6. **`codex exec` without a TTY waits on stdin.** Always `</dev/null`.
7. **A static detector cannot resolve `clamp()`.** It reported a 1.5:1 type ratio on a page that
   renders **8.4:1**. When the claim is visual, LOOK (D141).
8. **A substring is not a token.** `arize` matched 27 times; all 27 were "summarize".
9. **`git ls-tree -r HEAD -- '<glob>'` can return 0 entries and exit 0** where
   `git ls-files -s` returns 61. A hash built on the first would certify sameness forever (D140).
10. **Numbers are not OS-independent.** darwin and linux differ on 148 of 828 keys at the same
    commit. Platform-scope anything measured from a render.
11. **gitleaks reads "API: `value`" in prose as a key.** Name the command instead.
12. **`git subtree` cannot handle a path beginning with `-`.**

## Rules that bind every package

- **Verify before asserting.** Run the cheapest command that settles a question. If you cannot
  verify, say `UNVERIFIED`, name the exact check, and offer it.
- **Measure the class before fixing the instance.** Three of this session's four packages found
  the recorded scope was wrong. Enumerate the population first, and correct the row.
- **Done means merged AND verified running in production.** Confirm the deploy JOB ran — not
  `skipped`, not `cancelled`.
- **Never hand-generate committed baselines.** `gates.yml`'s `workflow_dispatch` only. A
  dispatch run SKIPS the suite, so a green dispatch proves nothing.
- **File budgets are shrink-only.** 250 lines / 32,000 bytes / 120 chars. **Wrap, never trim
  comments** — `geometry.spec.js` sat at exactly 250 and had to be modularized before one line
  could be added.
- **The ledger is updated in the same change.** Corrections stay. Rejected options carry reasons.
- **One work package, one PR, merged before the next starts.** Merge `main` in BEFORE starting.
- **RCA before the fix, as its own commit.** Then RED, then the fix. All four packages this
  session did that and it is visible in `git log`.

## Close the session properly

`docs/practices/session-close.md` is the protocol. Plain-English summary with NUMBERS · branch
merged and `main` level with origin, proved by command · branch deleted local AND remote ·
everything the session created cleaned up (report "none" rather than skipping the check) ·
handoff written. End with `Done` / `Verified myself` / `Cleanup` / `Pending` / `Next action`,
and say explicitly whether work is pushed, merged, and running in production.
