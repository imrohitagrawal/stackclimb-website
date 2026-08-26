ultracode

You are continuing work on **stackclimb.com**, the owner's personal site.
`/Users/rohitagrawal/Projects/designing-website`. Astro 5, static output, Cloudflare Pages.

The first word authorises the multi-agent **Workflow** tool for this whole session. Use it
where it earns its cost — the four places are named below — and never where it does not.

**Work the queue autonomously, top to bottom, one package at a time.** Every item in it is
already approved. Do not ask permission to start one. Where an item says OWNER, raise it in the
closing block and **skip it — never hold the queue waiting for an answer.**

---

## Ground truth before anything else

**DEPLOYMENT IS APPROACH C.** A merge to `main` deploys through CI and verifies production
itself (`gates.yml`'s `deploy` job). Never run manual `wrangler` unless that job fails —
break-glass only. **Done means merged AND verified running in production**, with the deploy job
having actually RUN (not `skipped`, not `cancelled`).

**W-24 (owner, 2026-08-15):** merge each PR autonomously once it is verified and green. That
delegates the MERGE only, never what the site claims about him — see P-18.

**THE REPOSITORY IS PUBLIC.** `gh repo view --json visibility` → `PUBLIC`. Everything in a
tracked file is published. On 2026-08-27 a sentence the owner said in private had been quoted
into four docs and was live on GitHub for two weeks (P-25). **Never write his private phrasing,
motivations or asides into a tracked file.** Record the decision; never the aside.

**GITHUB ACTIONS WAS DROPPING EVENTS on 2026-08-26/27.** Runs sat queued for over an hour with
zero jobs scheduled, and pushes produced no run at all. If a PR has no checks: confirm with
`gh api "repos/imrohitagrawal/stackclimb-website/actions/runs?head_sha=$(git rev-parse HEAD)"
--jq .total_count`, then force one with an empty commit. Close/reopen does **not** reliably
work. Never `--admin` merge to get around it without the owner's explicit word.

Read first, do not restate back: `AGENTS.md` · `docs/STATUS.md` · `docs/OWNER-DIRECTIVES.md` ·
`PRODUCT.md` · `DESIGN.md`. The ledger is the record; this file only points at it. The last
decision recorded is **D151**; the next you write is D152.

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
local set a generation behind the committed one is refused rather than silently trusted, and the
failure prints the command that repairs it.

**Skills currency belongs in PLANNING.** `npx skills update`, then diff `skills-lock.json`. Only
`computedHash` values moving count. `impeccable` is UNLOCKED and never appears there.

---

## Workflows — where a fan earns its cost, and where it must never be used

**Earns it.** Fan out, verify adversarially, converge:

1. **A judge panel when the ledger records options and picks none.** This paid for itself on
   DEF-65 (D140): three designs, three independent reviewers, unanimous — and the winning
   reframing corrected the ledger row itself.
2. **Review of any test change.** Two adversarial reviewers, at least one from a different model
   family: `codex exec --sandbox read-only "<prompt>" </dev/null`.
3. **Triage of a large finding set.** D141 is the shape: 25 findings, 7 refuted by measurement.
4. **Planning a change to a gate**, before a line of it is written.

**Never**: writing code (subagents share one working tree), parallel test runs (`astro preview`
is single-instance), or anything that generates baselines.

---

## The queue, in order, with the reason for the order

| # | Package | Why here |
|---|---|---|
| 1 | **P-22, both halves — the CV becomes takeable** | *Copy:* clipboard, clean plain text for pasting into an application form. Reuse the shape of `ContactEmail.astro` / `copy-email.js` but scope it to `/cv`, NOT `#contact` — that container does not exist there, which is exactly why the control was missing (D143). *Download:* **the owner ruled "build"** — a build-time PDF generated from the live `/cv` in the deploy pipeline. Not a print-trigger, never a hand-maintained file. Generate it AFTER the gates and BEFORE the wrangler upload, so a browser failure cannot block a good code deploy. **Gate it or it rots** — that is the DEF-65 shape: extend `post-deploy.mjs` to assert the PDF exists, has pages, and its last page is not blank |
| 2 | **The three `/cv` shortening changes, as ONE package with ONE render shown** | All approved 08-27. (a) a section index at the top — plain fragment links, no JS, the `#systems` pattern already on the home page; (b) `<details>` on the **Technical block only**, with `details[open]` forced in `@media print`; (c) the four oldest roles condensed. Together ~1.4 viewports. **Do NOT re-tighten the `/cv` ratchet afterwards** — the owner ruled it stays at today's height (D142), and its slack is deliberate and recorded |
| 3 | **DEF-71** — sweep and gate the line-number citations | Sweep **all 42** code citations, not only the 21 wrong ones: if the gate bans line numbers, accurate ones must go too or you need an allowlist — the DEF-10 / DEF-44 trap. Then `tests/cite-audit.mjs`, failing when a comment under `src/` or `tests/` writes `file.ext:NN`. **`docs/` is OUT OF SCOPE** — 303 citations, 274 unaudited, and a plan doc that cited a line when it was written is a historical record |
| 4 | **D141 records 2 + 3(a)** — `Bodoni Fallback` and the eight missing ground/surface/lit values into `DESIGN.md` front-matter | ONE edit to one block, not two packages. The prose at `DESIGN.md:204` already describes the font; `palette.css` declares ten ground/surface pairs where the front-matter lists six. No pixels move |
| 5 | **D141 record 3(b)** — `#7a2318`, hard-coded three times in one line at `hero-practice.css` | A real design-system leak: not a token, in no document. Give it a token and name it, or replace it with an existing one. Which of those is a **presentation** call — decide it, build it, and show the RENDER, never an option list |
| 6 | **The em-dash pass** | Approved 08-27. 40 in body copy on `/`, 34 on `/cv`. It is his voice: do the pass, then **show before/after per line and let him veto individually** before merging. A dash replacing a colon usually earns its place; the ones worth cutting are stacked two to a sentence |
| 7 | **The queue is empty** | Stop. Write the handoff, close the session, say so. Do not invent work |

## OWNER — raise in the closing block, then continue. Silence is not approval

| Item | What is needed, and what NOT to do |
|---|---|
| **"First runner-up"** | `/cv` says *"Runner-up — Anthropic Claude Community Impact Lab hackathon…"*. He reports the event had three prizes and this was FIRST runner-up. The certificate says only *"runner-up"*; the event page carries no results — both checked. One email to **Shubhangi Gupta** or **Rohaan Goswami**, who signed it, upgrades it to VERIFIED. **Do not print "first" on his account alone** unless he directs it, and if he does, mark it `REPORTED` in `docs/evidence/recognition.md`, not `VERIFIED` |
| ~~The Subex award name~~ | **CLOSED 08-27 (D150) — `VERIFIED`, both the recognitions and the naming. Do not re-raise it and do NOT downgrade it.** The naming is in the award mails, in embedded images the mail client will not draw; a rendering limitation is not an evidentiary one. `/cv` wording is correct as it stands |
| **DEF-75** | A **record gap, not work.** Two entries remain unrecorded — Oracle Rockstar and Amazon D2AS Finalist — and he holds no documents for either. They are internal and unpublishable by nature. **Never reconstruct a credential from memory** — that is inventing one. Log it only if a citation ever surfaces. BugATAhon (D147) and Subex (D148) are both VERIFIED |

## Do not reopen — decided, with reasons in the ledger

- **`/cv`'s ratchet stays at today's height** (D142): "do not minimize it".
- **The approximate disclaimers are off `/cv`** (P-25/D145), and the two gates that once required
  them now **refuse** them. Do not "restore" them.
- **P-25 scope** (D146): the P-9 label on the Aegis card and the colophon line **stay**.
- **Git history** (D146): the private phrasing stays in history. No force-push.
- **"Superhuman Lab"** stays off the CV line (D147). Presentation, already decided.
- **DEF-65 refuses, it does not delete** (D140). Do not add a drain.
- **`/cv` is NOT in `siteRoutes()`** (D126). It arrives via `platedRoutes()`.
- **DEF-52** obfuscation on · **I-4** backup on demand · **P-1**, **P-24** done ·
  **DEF-61/66** two `impeccable` trees are two builds of one skill — do not merge them.
- **The home panels** (D135): CiteVyn whole, SaafSaans with its header row. Do not re-crop.
- **DEF-19** is `LATENT`: there is no CSP, so nothing is failing. Not work.

## Traps that already cost this repo time

1. **Test the artefact the user actually gets, not a proxy you built — and never read an
   INCOMPLETE artefact as a complete one.** This cost THREE times in one session, and it is the
   single most repeated error on this repo's record (D144, D148, D150). A blank 4th page was
   reported to the owner from a headlessly-generated PDF, not his real download. Then two Gmail
   captures with **broken-image placeholders** were read as proving an award had a different
   name, when the naming was simply in images that had not loaded. **Absence in a partial
   capture is not evidence of absence.** Both times he corrected it from the real thing.
2. **When you remove something a gate requires, FLIP the gate, do not delete it.** P-25 removed
   two notes that two specs asserted. Deleting those checks would have removed the only thing
   that could notice a reversal. Inverted instead, each with a partner assertion.
3. **Never branch off an open PR.** Return to `main` first. A branch taken from an open PR
   swallowed its commits and that PR had to be closed unmerged.
4. **`git ls-tree -r HEAD -- '<glob>'` can return 0 entries and exit 0** where `git ls-files -s`
   returns 61. A hash built on the first certifies sameness forever (D140).
5. **A static analyser cannot resolve `clamp()`.** The detector reported a 1.5:1 type ratio on a
   page that renders **8.4:1** (D141). When the claim is visual, LOOK.
6. **PDF text extraction is unreliable** — font subsetting means visible text is not ASCII.
   Three checks were inconclusive before a render settled it. Say "inconclusive"; never round up.
7. **In zsh it is `$pipestatus[1]`, not `$PIPESTATUS[0]`.** A gate is its own `&&` step with no
   pipe, or use `--reporter=json` and read `stats`.
8. **Mutate a COPY, never the tree** — `git archive HEAD | tar -x -C <dir>`. It makes "commit
   green before mutating" unnecessary and cannot lose uncommitted work.
9. **A mutation run leaves a mutated `dist/`.** Rebuild before any screenshot or probe.
10. **`astro preview` is single-instance.** Kill scratch previews (`lsof -tiTCP:4321`) first; the
    error blames Playwright and is not Playwright.
11. **An unasserted string replace silently does nothing.** This file told the next session the
    last decision was **D147** when the ledger was at **D150** — two edits to it used
    `.replace()` without checking the anchor matched, and both no-opped in silence. The owner
    found it by reading the file. **Assert the anchor, or read the result back.** Every edit
    script in this session that asserted caught its own mistakes; the two that did not, shipped.
12. **Files sit AT their ceiling.** `geometry.spec.js` and `cv.css` were both at exactly 250.
    Pay for the budget by modularizing FIRST; wrap comments, never trim them.
13. **A substring is not a token.** `arize` matched 27 times, all "summarize"; `data-copy-email`
    matched `/cv` once and it was the script's own selector string.
14. **`codex exec` without a TTY waits on stdin.** Always `</dev/null`.
15. **Numbers are not OS-independent.** darwin and linux differ on 148 of 828 keys at the same
    commit. Platform-scope anything measured from a render.

## Rules that bind every package

- **Measure the class before fixing the instance.** Five packages this week found the recorded
  scope was wrong. Enumerate the population, then correct the row.
- **Verify before asserting.** Run the cheapest command that settles a question. If you cannot,
  say `UNVERIFIED`, name the exact check, and offer it.
- **RCA before the fix, as its own commit.** Then RED, then the fix. Visible in `git log`.
- **The ledger is updated in the same change.** Corrections stay. Rejected options carry reasons.
- **One work package, one PR, merged before the next starts.** Merge `main` in BEFORE starting.
- **Never hand-generate committed baselines.** `gates.yml`'s `workflow_dispatch` only, then
  download and commit the artifact. A dispatch run SKIPS the suite — get a normal PR run after.
  **Diff the baseline before trusting it**: a good change is confined to the routes you edited.
  Twice this week that was "3072 keys, 12 changed, all 12 on `/cv`".
- **File budgets are shrink-only.** 250 lines / 32,000 bytes / 120 chars.
- **Do not repair unrelated drift.** File a `DEF-` row instead.
- **Hermetic by default.** No paid calls for routine checks.
- **Disagree before you comply.** If an instruction contradicts the evidence, say so with the
  file, the line and the command output, state which you think is right, give an everyday
  analogy, then proceed on his answer. He has been right more often than not — including on the
  blank page, on the disclaimers, and on the "Anthropic" prefix, where the evidence I had read
  was the weaker source.

## Close the session properly

`docs/practices/session-close.md`. Never skipped: plain-English summary **with numbers** · every
branch merged and `main` level with origin, proved by command · branches deleted local AND
remote · everything the session created cleaned up (report "none" rather than skipping the
check) · the memory repo committed and pushed if any note changed · this file rewritten for the
next session in the same PR.

End with: `Done` / `Verified myself` / `Cleanup` / `Pending` / `Next action`. Say explicitly
whether work is pushed, merged, and running in production. If nothing is outstanding, say
"nothing pending — safe to close this session" in those words.
