# Handoff — for the next session

Written 2026-08-28, superseding the 2026-08-28 (critique/plan) handoff. Paste the fenced block
into a fresh Claude Code session in `/Users/rohitagrawal/Projects/designing-website`.

**This session shipped P1** — the highest-value package from D153's six-package plan — and it is
merged, deployed, and verified live. `docs/rca/RCA-011-cv-details-vanish-on-export.md` and
`docs/STATUS.md` D155 carry the full record; do not re-derive it.

**One thing the next session must not repeat**, caught inside this session:

- **A geometry baseline pinned to old copy will go red the moment that copy legitimately
  changes.** Editing `/experience`'s text (dropping a now-false clause) shifted a CTA row by
  13–14px at 390px width and failed CI's `geometry.spec.js` — correctly, not a false positive.
  Fixed by dispatching `gates.yml` with `update_geometry_baseline: true` on the branch,
  downloading the `geometry-baseline` artifact, diffing it against the committed one (confirm
  ONLY the intended rows changed), committing it, then re-pushing. `UPDATE_GEOMETRY=1` on a
  laptop cannot do this — DEF-59's guard refuses a darwin-written baseline outright.

---

## The block to paste

```
You are continuing work on stackclimb.com, the owner's personal site, in
/Users/rohitagrawal/Projects/designing-website. Astro 5, static output,
Cloudflare Pages, deployed by CI on merge to main (approach C, D81).

READ FIRST, IN THIS ORDER:
  AGENTS.md                  the rules (CLAUDE.md only imports it)
  docs/OWNER-DIRECTIVES.md   every instruction, with status
  docs/STATUS.md             D1-D155, defects, open items, rejected options
  docs/plan/critique-three-pages.md   the six-package plan; P1 is DONE (D155),
                              P2-P6 are still planned and unapproved for execution

Then stop trusting them. Verify by running the thing, not by reading about it.

WHAT THIS SESSION DID: shipped P1 (D155) — /cv's printed PDF and clipboard
copy both now carry the Independent Systems section in full (description,
Gate/Rule, Visit, Evidence), where before they silently dropped every closed
<details>'s content. Also fixed /experience's now-false "every approximate
figure marked as such" claim. Merged via PR #113, deployed through CI, and
independently re-verified against the LIVE site (not just the deploy log).

A conflict between D153's plan (strip the colophon's "approximate" wording)
and P-26's prior ruling (leave it) was raised to the owner before touching
anything. His ruling: leave the colophon alone. Only the /experience half of
that plan item shipped.

YOUR TASK: the owner has not said which package comes next. Ask, or if he
says "continue the plan," the plan's own ordering is undecided beyond P1 —
read docs/plan/critique-three-pages.md's package list (P2-P6) and confirm
with him rather than assuming P2 is next by number. P3 (the dead grid
classes) needs a runner-side geometry baseline regeneration the same way
this session did for P1 — see the note above and D155's own record of doing
it, before you start, not after you discover the gate goes red.

COMMANDS THAT PROVE THE CURRENT STATE — run these, do not trust the above:

  git status -sb                        # expect: clean, main level with origin/main
  git log --oneline -5                  # expect: c406993 (merge #113) at or near HEAD
  npx playwright test                   # darwin: ~475 pass, 2 unexpected (D140's
                                         #   local-baseline guard, expected on darwin),
                                         #   51 skipped. Linux CI measured 525/0/3 after
                                         #   this session's geometry regeneration.
  node tests/file-budget.mjs            # expect: green
  node tests/no-pii.mjs                 # expect: green
  npm run post-deploy                   # expect: green, hits the LIVE site

  # confirm P1 is actually live, not just deployed — direct production check:
  #   goto https://stackclimb.com/cv, emulateMedia print, page.pdf at
  #   0.4in margins, extract with pdf-parse, expect Delhi-NCR and
  #   citevyn.stackclimb.com PRESENT (this session measured them present)

CONSTRAINTS THAT WILL BITE:
  - Any package that changes VISIBLE COPY on a page geometry.spec.js covers
    (currently /, /experience, /how-i-build — check geometry.spec.js's own
    list before assuming a page is or isn't covered) needs the CI-dispatch
    baseline regeneration described above. Budget time for it; it is not
    optional and cannot be done locally.
  - Every gate change needs two adversarial reviewers, at least one from a
    different model family. `codex exec --sandbox read-only "<prompt>"`
    works but CANNOT run build/test commands itself (EPERM in its sandbox)
    — it reviews by reading, not executing, and its verdict should be
    labelled as such, not treated as equivalent to an executing reviewer.
  - Each package owes a docs/STATUS.md row and an RCA, written BEFORE the
    fix, in the same change as the fix.
  - work-package-protocol is global and NOT in this repository (D154).

SETTLED - do not reopen:
  - P-26: the colophon's "and marked approximate" line stays, on every page,
    screen only (it does not print). Confirmed again this session after a
    conflict with D153's plan was raised and the owner ruled explicitly.
  - P-25: /cv carries NO approximate disclaimers, screen or print.
  - D31 the CV is a page that prints, not a PDF upload. D38 no phone
    number. DEF-52 Cloudflare email obfuscation, closed as accepted.
    D123 the two impeccable trees are two builds for two runtimes.
  - D30 light/dark deferred, D153 adds the Value-Ladder-is-built-on-darkness
    argument. STILL OPEN, owner's call — do not build it either way.
```

---

## State at handoff, by command

| Check | Command | Result |
|---|---|---|
| Branch | `git rev-parse --abbrev-ref HEAD` | `main`, level with `origin/main` (`git log --oneline main..origin/main` empty) |
| Tree | `git status --short` | clean |
| Merged | `gh pr view 113 --json state,mergedAt` | `MERGED`, `2026-08-27T21:20:45Z` |
| Deploy | `gh run view 33117712890` | gates job pass, secrets job pass, deploy-then-verify job pass — all three, not skipped |
| Post-deploy | `npm run post-deploy` | green, against the live origin |
| Production, directly | PDF pulled from `https://stackclimb.com/cv` itself | `Delhi-NCR`, `citevyn.stackclimb.com`, 4× `GATE`, `RULE` all present; page-1 2122 chars |
| Suite (darwin, local) | `npx playwright test` | 475 pass, 2 unexpected (D140, expected), 51 skipped |
| Suite (linux, CI) | `gh run view 33116901949` | 525 pass, 0 fail, 3 skipped |
| Budget / PII | `node tests/file-budget.mjs` · `node tests/no-pii.mjs` | both green |
| Branch cleanup | `git branch -a` | only `main` and `origin/main` — `p1-cv-output-integrity` deleted both sides |
| Orphaned processes | `ps aux \| grep -E 'astro\|playwright'` | none |
| Dependencies | `git diff origin/main~5 origin/main -- package.json` | empty — none added |

## What this session did NOT do

- P2–P6 of D153's plan remain planned and unapproved for execution.
- The owner has not been asked which package to take next; do not assume P2 by number.
- The light/dark position (D30/D153) is recorded, not decided.
