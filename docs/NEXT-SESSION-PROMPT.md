ultracode

You are continuing work on **stackclimb.com**, the owner's personal site.
`/Users/rohitagrawal/Projects/designing-website`. Astro 5, static output, Cloudflare Pages.

The first word authorises the multi-agent **Workflow** tool for this whole session. Use it where
it earns its cost — the four places are named below — and never where it does not.

**Work the queue autonomously, top to bottom, one package at a time.** Do not ask permission to
start a queued item; the owner has already approved every one of them. Ask only where the table
says OWNER, and never stop the queue waiting for an answer — skip that item and continue.

---

## Ground truth before anything else

**DEPLOYMENT IS APPROACH C.** A merge to `main` deploys through CI and verifies production
itself (`gates.yml`'s `deploy` job). Never run manual `wrangler` unless the deploy job fails —
break-glass only. **Done means merged AND verified running in production**, with the deploy job
having actually RUN (not `skipped`, not `cancelled`).

**W-24 (owner, 2026-08-15):** merge each PR autonomously once it is verified and green. That
delegates the MERGE only. It does not delegate what the site claims about the owner — see P-18.

**THE REPOSITORY IS PUBLIC.** `gh repo view --json visibility` → `PUBLIC`. Everything you write
into a tracked file is published. On 2026-08-27 a sentence the owner said in private had been
quoted into four docs and was live on GitHub for two weeks (P-25). **Never put his private
phrasing, motivations, or off-hand remarks into a tracked file.** Record the decision, never the
aside.

Read first, do not restate back: `AGENTS.md` · `docs/STATUS.md` · `docs/OWNER-DIRECTIVES.md` ·
`PRODUCT.md` · `DESIGN.md`. The ledger is the record; this file only points at it. The last
decision recorded is **D145**; the next you write is D146.

## Prove the starting state, and paste the output

```bash
git rev-parse --abbrev-ref HEAD && git rev-list --left-right --count origin/main...main
git status --porcelain | wc -l
node tests/file-budget.mjs && node tests/no-pii.mjs
node tests/geometry-selftest.mjs && node tests/baseline-guard-selftest.mjs
node tests/baseline-stamp-selftest.mjs && node tests/hook-binding-selftest.mjs
node tests/post-deploy.mjs --self-test
npm run build && npm run post-deploy
gh run list --branch main --limit 1
```

Expected: level with origin, clean tree, **all seven self-tests pass**, production green.

**If a baseline gate refuses, READ THE REFUSAL — do not regenerate reflexively.** Since D140 a
local baseline set that is a generation behind the committed one is refused rather than silently
trusted, and the failure names the exact command that repairs it. There is no longer a prose
warning in this handoff about local red, because the cause is fixed.

**Skills currency belongs in PLANNING, not implementation.** `npx skills update`, then diff
`skills-lock.json`. Only `computedHash` values moving count. `impeccable` is UNLOCKED and never
appears in that file.

---

## Where a workflow earns its cost, and where it must not be used

**Earns it** — fan out, verify adversarially, converge:

1. **A judge panel when the ledger records options and picks none.** This paid for itself on
   DEF-65 (D140): three designs, three independent reviewers, unanimous, and the winning
   reframing corrected the row itself.
2. **Review of any test change**, two adversarial reviewers, at least one from a different model
   family (`codex exec --sandbox read-only "<prompt>" </dev/null`).
3. **Triage of a large finding set** — the D141 backlog is the shape.
4. **Planning a change to a gate**, before writing it.

**Never**: writing code (subagents share one working tree), parallel test runs (`astro preview`
is single-instance), or anything that generates baselines.

---

## The queue, in order, with the reason for the order

| # | Package | Why here |
|---|---|---|
| 1 | **DEF-74 (MEDIUM)** — `/cv` section labels carry `letter-spacing` 0.10–0.16em with no print reset, so text extracted from the PDF reads `EXPE R IE N C E` | The only open item that can cost a real application. ATS parsers find sections by heading; a parser looking for `EXPERIENCE` does not match. Invisible to the owner because the PDF *looks* right. Fix: reset `letter-spacing` on labels inside `@media print`; screen keeps the tracked-caps register. **Prove it by extracting text from a generated PDF, not by looking at it** |
| 2 | **P-22 COPY half** — `/cv` puts the CV on the clipboard as clean plain text | Owner-requested (D143). Reuse the shape of `ContactEmail.astro` / `copy-email.js`, but scoped to `/cv`, NOT to `#contact` — that container does not exist there, which is the whole reason the control was missing. A recruiter needs ATS-pasteable text, not the email address. **The DOWNLOAD half is OWNER — do not build it** |
| 3 | **The three `/cv` shortening changes**, as ONE package with ONE render shown | All three approved 2026-08-27. (a) a section index at the top — plain fragment links, no JS, the `#systems` pattern already on the home page; (b) `<details>` on the **Technical block only**, with `details[open]` forced in `@media print`; (c) the four oldest roles condensed. Together ~1.4 viewports. **Do NOT re-tighten the `/cv` ratchet afterwards** — the owner ruled it stays at today's height (D142) |
| 4 | **DEF-71** — sweep and gate the line-number citations | Sweep **all 42** code citations, not just the 21 wrong ones: if the gate bans line numbers, accurate ones must go too, or you need an allowlist — the DEF-10 / DEF-44 trap. Then `tests/cite-audit.mjs`, failing when a comment under `src/` or `tests/` writes `file.ext:NN`. **`docs/` is OUT OF SCOPE** — 303 citations, 274 unaudited, and a plan doc that cited a line when written is a historical record |
| 5 | **D141 records 2 + 3(a)** — `Bodoni Fallback` and the eight missing ground/surface/lit values into `DESIGN.md` front-matter | One edit to one block, not two packages. The prose at `DESIGN.md:204` already describes the font; `palette.css` declares ten ground/surface pairs where the front-matter lists six. No pixels move |
| 6 | **D141 record 3(b)** — `#7a2318`, hard-coded three times in one line at `hero-practice.css` | A genuine design-system leak: not a token, in no document. Give it a token and name it, or replace it with an existing one. Which of those is a **presentation** call — decide it, build it, and show the RENDER, never an option list |
| 7 | **The em-dash pass** | Approved 2026-08-27. 40 in body copy on `/`, 34 on `/cv`. It is his voice: do the pass, then **show before/after per line and let him veto individually** before merging. A dash replacing a colon usually earns its place; the ones worth cutting are stacked two to a sentence |
| 8 | **The queue is empty** | Stop. Write the handoff, close the session, and say so. Do not invent work |

## OWNER — raise, then continue. Silence is not approval

Never start these. Never block the queue on them. Put them in the closing status block.

| Item | What is needed |
|---|---|
| **P-24** | The missing certificates: issuer, exact title, year, verifiable ID or URL. The section already lists a degree and three certifications, so something he holds is absent. **Never guess a credential** — a fabricated one is the worst defect this site could ship |
| **P-22 DOWNLOAD half** | A print-trigger button labelled as printing, or a build-time PDF generated from the page with a gate proving it matches? A hand-maintained PDF is barred — that is a second source of truth that drifts |
| **Git history** | P-25 cleared his private phrasing from `HEAD`, not from history, which is public and reachable by SHA. Erasing it needs a force-push that breaks every clone and every SHA the ledger cites |
| **P-25 scope** | Two `approximate` remain on `/cv`: the P-9 evidence label on the Aegis card, and the site-wide colophon line (which does not print). Different devices — he may or may not want them gone |

## Do not reopen — decided, with reasons in the ledger

- **`/cv`'s ratchet stays at today's height** (D142). He said "do not minimize it". Its ~1.8
  viewports of slack after the shortening changes is deliberate and recorded.
- **The approximate disclaimers are off `/cv`** (P-25/D145), and the two gates that once
  required them now **refuse** them. Do not "restore" them.
- **DEF-65's mechanism refuses, it does not delete** (D140). Do not add a drain.
- **`/cv` is NOT in `siteRoutes()`** (Rejected table, D126). It arrives via `platedRoutes()`.
- **DEF-52** obfuscation stays on · **I-4** memory backup is on demand · **P-1** done ·
  **DEF-61/66** the two `impeccable` trees are two builds of one skill — do not merge them.
- **The home panels** (D135): CiteVyn whole, SaafSaans with its header row. Do not re-crop.
- **DEF-19** is `LATENT`: there is no CSP, so nothing is failing. Not work.

## Traps that already cost this repo time

1. **Test the artefact the user actually gets, not a proxy you built.** On 08-27 a blank 4th
   page was reported to the owner; it existed only in a headlessly-generated PDF, not in his
   real download. He corrected it with his own file. **The most expensive error of the session.**
2. **When you remove something a gate requires, FLIP the gate, do not delete it.** P-25 removed
   two notes that two specs asserted. Deleting those checks would have removed the only thing
   that could notice a reversal. Inverted instead, each with a partner assertion.
3. **`git ls-tree -r HEAD -- '<glob>'` can return 0 entries and exit 0** where `git ls-files -s`
   returns 61. A hash built on the first certifies sameness forever (D140).
4. **A static analyser cannot resolve `clamp()`.** The detector reported a 1.5:1 type ratio on a
   page that renders **8.4:1** (D141). When the claim is visual, LOOK.
5. **PDF text extraction is unreliable** — font subsetting means even visible text is not ASCII.
   Three checks were inconclusive before a render settled it. Say "inconclusive"; never round up.
6. **In zsh it is `$pipestatus[1]`, not `$PIPESTATUS[0]`.** A gate in a script is its own `&&`
   step with no pipe, or use `--reporter=json` and read `stats`.
7. **Never branch off an open PR.** Return to `main` first. On 08-27 a branch taken from an open
   PR swallowed its commits and that PR had to be closed unmerged.
8. **Mutate a COPY, never the tree** — `git archive HEAD | tar -x -C <dir>`. It makes
   "commit green before mutating" unnecessary and cannot lose uncommitted work.
9. **A mutation run leaves a mutated `dist/`.** Rebuild before any screenshot or probe.
10. **`astro preview` is single-instance.** Kill scratch previews (`lsof -tiTCP:4321`) first; the
    error blames Playwright and is not Playwright.
11. **Files sit AT their ceiling.** `geometry.spec.js` and `cv.css` were both at exactly 250.
    Pay for the budget by modularizing FIRST; wrap comments, never trim them.
12. **A substring is not a token.** `arize` matched 27 times, all "summarize"; `data-copy-email`
    matched `/cv` once, and it was the script's own selector string.
13. **`codex exec` without a TTY waits on stdin.** Always `</dev/null`.
14. **Numbers are not OS-independent.** darwin and linux differ on 148 of 828 keys at the same
    commit. Platform-scope anything measured from a render.

## Rules that bind every package

- **Measure the class before fixing the instance.** Three of four packages on 08-26 and two on
  08-27 found the recorded scope was wrong. Enumerate the population, then correct the row.
- **Verify before asserting.** Run the cheapest command that settles a question. If you cannot,
  say `UNVERIFIED`, name the exact check, and offer it. Never let a guess wear a fact's clothes.
- **RCA before the fix, as its own commit.** Then RED, then the fix. Visible in `git log` for
  every package since 08-26.
- **The ledger is updated in the same change.** Corrections stay. Rejected options carry reasons.
- **One work package, one PR, merged before the next starts.** Merge `main` in BEFORE starting.
- **Never hand-generate committed baselines.** `gates.yml`'s `workflow_dispatch` only, then
  download and commit the artifact. A dispatch run SKIPS the suite, so get a normal PR run after.
  Diff the baseline before trusting it — a good change is confined to the routes you edited.
- **File budgets are shrink-only.** 250 lines / 32,000 bytes / 120 chars.
- **Do not repair unrelated drift.** File a `DEF-` row instead.
- **Hermetic by default.** No paid calls for routine checks.
- **Disagree before you comply.** If an instruction contradicts the evidence, say so with the
  file, the line and the command output, state which you think is right, give an everyday
  analogy, then proceed on his answer. He has been right at least twice; so has the evidence.

## Close the session properly

`docs/practices/session-close.md`. Never skipped: plain-English summary **with numbers** ·
every branch merged and `main` level with origin, proved by command · branches deleted local AND
remote · everything the session created cleaned up (report "none" rather than skipping the
check) · the memory repo committed and pushed if any note changed · this file rewritten for the
next session in the same PR.

End with the closing status block: `Done` / `Verified myself` / `Cleanup` / `Pending` /
`Next action`. Say explicitly whether work is pushed, merged, and running in production. If
nothing is outstanding, say "nothing pending — safe to close this session" in those words.
