# Handoff — for the next session

Written 2026-08-28, superseding the 2026-08-12 handoff (which had gone stale in three
ways: it said Astro 7, described deploys as manual, and stopped at D75). Paste the fenced
block into a fresh Claude Code session in `/Users/rohitagrawal/Projects/designing-website`.

**This session shipped no code.** It ran the first `$impeccable critique` of `/experience`,
`/how-i-build` and `/cv` — three routes that had never had one — and produced a six-package
plan. Everything is written down: **D153** (the critique and the plan), **D154** (the skill
refresh), and `docs/plan/critique-three-pages.md`. Nothing is half-done and no branch is open.

**The session ends here for a rule reason, not a context reason.** `npx skills update` moved
one of 51 hashes, and AGENTS.md's phase table is Plan → Refresh → **Restart** → Implement.

**Three things the next session must not repeat**, all of them mistakes made and caught
*inside* this session:

1. **A `fullPage` Playwright capture renders scroll-revealed plates blank.** It is a capture
   artifact. Before calling anything invisible, scroll it into a real viewport and read
   `getComputedStyle` — the first read here said "defect", the second said `opacity: 1`.
2. **Substring is not token, again.** A PDF probe reported the `Gate` label PRESENT because
   `gates` appears in the summary paragraph. This is the third recorded instance of that
   exact error in this repository.
3. **Playwright's default PDF margins hide a real defect.** `page.pdf({format:'A4'})` with no
   margin gives 78% page-1 fill; Chrome's actual default (0.4in) gives 38%. `pdf-text.spec.js`
   uses the former, which is one of two reasons it cannot see the hole in the CV.

---

## The block to paste

```
You are continuing work on stackclimb.com, the owner's personal site, in
/Users/rohitagrawal/Projects/designing-website. Astro 5, static output,
Cloudflare Pages, deployed by CI on merge to main (approach C, D81).

FIRST, BEFORE READING ANYTHING ELSE - find out where this plan lives. It
was committed on a branch and may or may not have been merged since:

  git status -sb
  git log --oneline -3
  ls docs/plan/critique-three-pages.md

  - If that file exists on your current branch: nothing to do, carry on.
  - If it does not: the work is on `critique-three-pages` (commit c020260,
    docs only, no code, no deploy). Merge it into main, or check it out,
    before you start. Do not re-derive the plan - it took a five-agent
    critique to produce and every finding in it is verified by command.

  git branch -a | grep critique-three-pages   # is it local, remote, both?

Whatever you find, say it out loud in your first reply rather than
assuming. The last session left this unmerged deliberately, because
pushing is the owner's call, not the agent's.

READ FIRST, IN THIS ORDER:
  AGENTS.md                        the rules (CLAUDE.md only imports it)
  docs/OWNER-DIRECTIVES.md         every instruction, with status
  docs/STATUS.md                   D1-D154, defects, open items, rejected options
  docs/plan/critique-three-pages.md   the plan you are here to execute

Then stop trusting them. Every one of those files has been wrong in both
directions. Verify by running the thing, not by reading about it.

WHAT THE LAST SESSION DID: the first critique of /experience, /how-i-build
and /cv. Scores 23/40, 16/28, 24/40 against the home page's 22/32. Six
packages planned, none started, nothing executed against the repo.

YOUR TASK: execute package P1 unless the owner says otherwise. It is the
only package that changes the artefact a hiring manager actually receives,
both of its fixes are already proven by execution, and it is the smallest
diff of the six.

BEFORE YOU WRITE ANY CODE:
  1. Write the RCA. AGENTS.md's order is Investigate -> RCA -> state the
     need -> get approval -> then work. Investigating is not working.
  2. Branch. One work package, one PR, merged before the next starts.
     Merge main into the branch before starting, not after.
  3. Write the gate RED first and prove it bites.

P1 IN ONE PARAGRAPH: /cv's printed PDF is missing the section the CV exists
for. Independent Systems prints as six names and six statuses - no
descriptions, no GATE/RULE statements, no Visit or Evidence URLs, and
"stackclimb" appears zero times in the whole file. "NarraTwin AI - PHASE 1
- NO-GO" prints naked, so the site's best honesty move reads as a failed
project. The same content is missing from Copy as text. Both fixes were
already written by a previous session and both lose: cv-print.css:77
overrides `display` but Chrome now hides closed <details> via
`content-visibility` on ::details-content; cv-print.css:55 sets
.cv{padding:0} and global.css:84's .plate beats it on source order.

COMMANDS THAT PROVE THE CURRENT STATE - run these, do not trust the above:

  # the details content is missing from the PDF (expect: all MISSING)
  npm run build
  node -e "..." # serve dist/, then:
  #   page.pdf({format:'A4', margin:{top:'0.4in',bottom:'0.4in',
  #             left:'0.4in',right:'0.4in'}})
  #   extract with node_modules/pdfjs-dist/legacy/build/pdf.mjs
  #   probe for: Delhi-NCR, citevyn.stackclimb.com, Evidence, stackclimb
  # USE 0.4in MARGINS. Playwright's defaults hide the second defect.

  # the print padding survives (expect: 88px, 720px, grid)
  #   page.emulateMedia({media:'print'}) then getComputedStyle('.cv')
  #   -> paddingTop, minHeight, display

  # the dead grid classes, P3 (expect: "551.672px 499.125px" on both)
  #   getComputedStyle('.plate-grid') at 1440 on /experience and
  #   /how-i-build; compare /projects/citevyn, which gives "1122.81px"

  # what is green, MEASURED on darwin 2026-08-28, not inherited
  npx playwright test          # 473 expected, 2 unexpected, 51 skipped
  node tests/file-budget.mjs   # 131 files within the D8 budget
  node tests/no-pii.mjs        # 221 files scanned, clean

  # THE 2 FAILURES ARE EXPECTED ON A LAPTOP AND ARE NOT A DEFECT.
  # Both are "the baseline itself is a real baseline" (desktop + mobile),
  # which is D140/DEF-65's guard REFUSING a local darwin baseline that is a
  # generation behind the committed linux one - by design, rather than
  # silently trusting it. tests/geometry-baseline.darwin.json is gitignored
  # (.gitignore:114) and has never been committed; the linux one was
  # regenerated at the current HEAD. The 51 skips are the geometry
  # comparisons that guard gates. To clear it locally:
  #   UPDATE_GEOMETRY=1 npx playwright test tests/geometry.spec.js --workers=1
  # CI on linux is the authority. Do NOT read the 2 as a regression, and do
  # NOT quote D126's "492 expected, 0 unexpected, 2 skipped" as a local
  # baseline - that number was measured in CI, on linux.

CONSTRAINTS THAT WILL BITE:
  - P3 needs a runner-side geometry baseline regeneration. The baseline
    recorded the DEFECTIVE 544px width, so fixing the layout turns the gate
    red, and DEF-59's guard refuses a laptop.
  - Every gate change needs two adversarial reviewers, at least one from a
    different model family. A subagent of your session is context
    isolation, not model decorrelation. Use codex.
  - work-package-protocol is NOT in this repository. It resolves through
    ~/.claude/skills/ to ~/stackclimb-skills/. See D154.
  - Each package owes a docs/STATUS.md row in the same change.

SETTLED - do not reopen:
  - P-25: /cv carries NO approximate disclaimers, screen or print. Do not
    restore them. proof-cv.spec.js enforces their absence.
  - D31: the CV is a page that prints, not a PDF upload.
  - D38: no phone number, and every workaround is banned by name.
  - D30: light/dark theme deferred. D153 adds the argument that the Value
    Ladder is built on darkness. Owner's call, still open.
  - DEF-52: Cloudflare email obfuscation, closed as accepted 08-27.
  - D123: the two impeccable trees are two builds for two runtimes.
    Symlinking them is in the rejected table.
  - /experience renders eras oldest -> newest on purpose (D57 clause 8),
    and era lines carry zero digits, gated in experience.spec.js.
```

---

## State at handoff, by command

| Check | Command | Result |
|---|---|---|
| Branch | `git rev-parse --abbrev-ref HEAD` | `main`, level with `origin/main` |
| Tree | `git status --short` | clean after this session's commit |
| Build | `npm run build` | 9 pages, clean |
| Suite | `npx playwright test` | **473 expected, 2 unexpected, 51 skipped** — the 2 are D140's local-baseline refusal, expected on darwin, explained in the block above |
| Budget | `node tests/file-budget.mjs` | 131 files within the D8 budget |
| PII | `node tests/no-pii.mjs` | 221 files scanned, clean |
| Production | `curl -w` on the four routes | HTTP 200, TTFB 0.19–0.27s |
| Skills | `npx skills update -y -p` | 51 updated, **1 hash moved** (`performance-optimization`) |
| Critique archive | `ls .impeccable/critique/` | 8 snapshots — 5 prior, 3 from this session |

## What this session did NOT do

- No code changed. No branch opened. No deploy.
- No package started. P1 through P6 are planned and unapproved for execution.
- The `og.png` regeneration (P6) needs Pillow, which this Node-only CI does not carry —
  see `tests/og-watermark.spec.js` for the manual procedure and why it stays manual.
- The light/dark position is **recorded, not decided**. D153 carries the recommendation;
  the owner has not ruled.
