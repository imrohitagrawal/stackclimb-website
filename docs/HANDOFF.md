# Handoff — for the next session

Written 2026-08-30, superseding the 2026-08-28 (P1-close) handoff. Paste the fenced block into
a fresh Claude Code session in `/Users/rohitagrawal/Projects/designing-website`.

**This session shipped P2, P3, and P4** — three of D153's six-package plan — all merged,
deployed, and independently verified live. It also gathered P5's groundwork (surface briefs,
fresh fold measurements) and stopped there, per the owner's own instruction that P5 needs a real
working session, not another automated pass. `docs/STATUS.md` D156/D157/D158 carry the full
record for P2/P3/P4; do not re-derive it. The three RCAs are
`docs/rca/RCA-012-how-i-build-evidence-fidelity.md`, `RCA-013-dead-one-col-grid-and-narrow-overflow.md`,
`RCA-014-livery-and-hierarchy-gaps.md`.

**Things the next session must not repeat**, caught inside this session:

- **A forked subagent (`Agent` tool, `subagent_type: "fork"`) can silently do nothing.** Launched
  once for P2 with a long autonomous task; it returned in 17 seconds having made zero tool calls
  beyond echoing a status narration back. Verified via `git`/`gh` that nothing was created.
  Switched to fresh `general-purpose` agents with fully self-contained prompts for the rest of
  the session — more reliable, but see the next point.
- **A subagent that backgrounds a long shell command (or spawns its own nested `Agent` call) and
  then stops to "wait for a notification" does not get resumed the way the top-level session
  does.** This happened repeatedly (waiting on a nested review agent, waiting on a backgrounded
  `codex exec`, waiting on its own `Monitor`). Each time, the parent session had to notice the
  stall via `ListAgents`/`ps`, verify the real state directly, and either resume the agent with
  `SendMessage` or take over the remaining work itself. If dispatching another agent for a future
  package, tell it explicitly to poll its own long-running work in a bounded loop within its own
  tool calls, never to background something and stop expecting an external wake-up.
- **A geometry baseline pinned to old styling will go red the moment that styling legitimately
  changes** — this bit P2, P3, and P4, each needing the same CI-dispatch dance: `gh workflow run
  gates.yml --ref <branch> -f update_geometry_baseline=true -f update_visual_baselines=<as
  needed>`, wait for it, download the artifact, diff it PROGRAMMATICALLY against the committed
  file (a Python script comparing flattened key paths — a raw text diff of a 40KB+ JSON is not
  reviewable), confirm only the expected routes moved, then commit. `UPDATE_GEOMETRY=1` on a
  laptop cannot do this — DEF-59's guard refuses a darwin-written baseline outright, and D140's
  local-baseline guard means a full local `npx playwright test` run will ALWAYS show 2 unexpected
  geometry failures on darwin, unrelated to whatever you're building — that is expected, not a
  regression to chase.
- **`tests/geometry.spec.js` has a structural row/child-count floor (DEF-60) that fires even
  during `update_geometry_baseline` mode**, specifically so a baseline regen can't launder away a
  real structural loss (a list losing an item, a row's child count dropping). If the dispatch
  itself fails with "structural rows measured, floor is N" or "row population shrank," that is
  NOT a baseline problem — fix the structural regression in the markup first (P4 hit this:
  restructuring `.skill-repos` from 2 list items to 1-plus-a-paragraph tripped it; the fix was
  keeping the same DOM shape, wording only), then re-dispatch.
- **A visible color/weight/size fix needs its ACTUAL rendering context checked, not just its
  declared value.** P4's employer-name fix and new ground colors both looked right by their own
  contrast math against `--ground`, but axe's live scan (which scrolls each plate into view and
  waits for the ground cross-fade before scanning) caught a real WCAG AA failure that only showed
  up on `--surface` — a different, lighter background layer the link actually renders against.
- **BSD sed's `0,/pattern/s//x/` GNU-only range address silently no-ops on macOS** — no error,
  file unchanged. A mutation test built on this looked like it passed when no mutation had
  actually happened. Use Python for any scripted find/replace, and always grep/diff a file
  immediately after any sed edit before trusting a subsequent test result.

---

## The block to paste

```
You are continuing work on stackclimb.com, the owner's personal site, in
/Users/rohitagrawal/Projects/designing-website. Astro 5, static output,
Cloudflare Pages, deployed by CI on merge to main (approach C, D81).

READ FIRST, IN THIS ORDER:
  AGENTS.md                  the rules (CLAUDE.md only imports it)
  docs/OWNER-DIRECTIVES.md   every instruction, with status (row W-25 records
                              the owner's standing authorization for this
                              D153 P2-P6 run)
  docs/STATUS.md             D1-D158; read the tail, not the whole file
  docs/plan/critique-three-pages.md   the six-package plan. P1 (D155), P2
                              (D156), P3 (D157), P4 (D158) are DONE. P5 has
                              GROUNDWORK ONLY (three draft surface briefs in
                              .impeccable/surfaces/, fresh fold measurements)
                              and is NOT resolved. P6 has not started.

Then stop trusting them. Verify by running the thing, not by reading about it.

WHAT THIS SESSION DID:
  - P2 (D156): fixed six drifted/inaccurate claims on /how-i-build (stale
    skill count, .github mischaracterized as a skill, wrong OTel/Prometheus
    system count, CiteVyn state disagreeing between pages, a fused artefact
    quote, and the evidence file backing that quote also failing verbatim
    standards). PR #116, merge 00bb11c.
  - P3 (D157): fixed dead .one-col/.wide grid classes (48.4% -> full-width
    render on /experience and /how-i-build), a min-width:0 overflow at
    320/360px, and .era-org's date-orphaning at narrow widths. PR #118,
    merge ccdbd46.
  - P4 (D158): fixed three plates missing their per-plate ground color,
    ochre's six overloaded roles on /cv (employer names no longer
    masquerade as links), one invisible emphasis span, and /cv's crowded
    type scale -- plus a WCAG AA contrast failure found by axe's live scan,
    not assumed from static contrast math. PR #119, merge 76e2cd1.
  - P5 groundwork (no D-number -- explicitly not a shipped package): three
    DRAFT surface briefs in .impeccable/surfaces/ (each flags its own
    proposed visitor mode as needing the owner's confirmation), plus fresh
    2026-08-30 measurements showing the /how-i-build artefact-fold problem
    got WORSE since D153 (P2's own accuracy fix made the quote taller), the
    /experience closing-sentence fold problem also got slightly worse (P3's
    era-org fix added a line), and /cv's NarraTwin disclosure ALREADY reads
    well after P1's fix -- the real open question is a self-description
    call (does an undeployed project belong in "Independent Systems" on a
    take-away document at all), not a layout fix. PR #120, merge e65e589.
  - Two small ledger-maintenance PRs: #115 (W-25 authorization row), #117
    (correcting D156 once P2's own geometry saga surfaced after the row was
    first written).

YOUR TASK: P5 needs a real working session with the owner -- do NOT attempt
to resolve its reserved decisions (visitor mode per page, whether to
restructure /how-i-build to hoist the artefact, whether NarraTwin/EvalAxis/
Aegis belong on /cv at all) or ship anything for it yourself. If the owner
says "continue the plan" without addressing P5 directly, ask him explicitly
-- do not assume silence means proceed to P6. P6 (og.png + home-page
re-critique) is explicitly blocked on P5 by the plan's own text ("re-critique
/ before touching it," and P5's eventual decisions may still touch the home
page).

COMMANDS THAT PROVE THE CURRENT STATE -- run these, do not trust the above:

  git status -sb                        # expect: clean, main level with origin/main
  git log --oneline -5                  # expect: e65e589 (merge #120) at or near HEAD
  npx playwright test                   # darwin: ~515 pass, 2 unexpected (D140's
                                         #   local-baseline guard, expected on darwin),
                                         #   51 skipped.
  node tests/file-budget.mjs            # expect: green
  node tests/no-pii.mjs                 # expect: green
  npm run post-deploy                   # expect: green, hits the LIVE site
  ps aux | grep -E 'astro|playwright'   # expect: nothing (no orphaned dev/preview servers)

  # confirm P4 is actually live, not just deployed -- direct production check:
  #   goto https://stackclimb.com/cv, check .cv-job-head .org's computed
  #   color != .cv a's computed color (employer names no longer look like
  #   links); goto https://stackclimb.com/how-i-build, check
  #   #published-skills's computed background-color != base #0e1322
  #   (this session measured both correct on the live site)

CONSTRAINTS THAT WILL BITE (see this file's own opening section above for
the full detail on each):
  - Any package that changes visible styling or copy on a page
    geometry.spec.js covers needs the CI-dispatch baseline regeneration --
    check tests/lib/routes.mjs's siteRoutes()/platedRoutes() for the current
    route list before assuming a page is or isn't covered.
  - geometry.spec.js's DEF-60 structural floor fires even in baseline-update
    mode -- a "structural rows measured, floor is N" error means fix the
    markup, not the baseline.
  - A color/weight fix needs its ACTUAL render context checked (ground vs.
    surface vs. lit), not just the value you changed.
  - Every gate change needs two adversarial reviewers, at least one from a
    different model family. Codex (`codex exec --sandbox read-only`) cannot
    run build/test commands (EPERM) -- static-analysis-only, labelled as such.
  - Each package owes a docs/STATUS.md row and an RCA, written BEFORE the
    fix, in the same change as the fix.
  - If dispatching a subagent for a package: tell it explicitly not to
    spawn nested Agent calls or background-and-wait for its own long-running
    work -- poll within its own tool calls instead. See this file's opening
    section for what happened when this wasn't said.
  - work-package-protocol is global and NOT in this repository (D154) --
    re-check its currency if leaning on it.

SETTLED -- do not reopen:
  - P-26: the colophon's "and marked approximate" line stays, on every
    page, screen only (it does not print).
  - P-25: /cv carries NO approximate disclaimers, screen or print.
  - D31 the CV is a page that prints, not a PDF upload. D38 no phone
    number. DEF-52 Cloudflare email obfuscation, closed as accepted.
    D123 the two impeccable trees are two builds for two runtimes.
  - D30 light/dark deferred. STILL OPEN, owner's call -- do not build it
    either way.
  - RCA-012's "conflict raised, not silently resolved" section and P4's
    surface-vs-ground contrast finding are both resolved in-session; no
    need to reopen either.
```

---

## State at handoff, by command

| Check | Command | Result |
|---|---|---|
| Branch | `git rev-parse --abbrev-ref HEAD` | `main`, level with `origin/main` (`git log --oneline main..origin/main` empty) |
| Tree | `git status --short` | clean |
| P2 merged | `gh pr view 116 --json state,mergedAt` | `MERGED` |
| P3 merged | `gh pr view 118 --json state,mergedAt` | `MERGED` |
| P4 merged | `gh pr view 119 --json state,mergedAt` | `MERGED` |
| P5 groundwork merged | `gh pr view 120 --json state,mergedAt` | `MERGED` (docs only) |
| Deploys | `gh run view <run-id>` per merge | every merge's deploy job ran (not skipped) and passed |
| Post-deploy | `npm run post-deploy` | green, against the live origin |
| Production, directly | Playwright against `https://stackclimb.com` | P2/P3/P4 fixes all independently re-measured live and confirmed present |
| Suite (darwin, local) | `npx playwright test` | 515 pass, 2 unexpected (D140, expected), 51 skipped |
| Budget / PII | `node tests/file-budget.mjs` · `node tests/no-pii.mjs` | both green |
| Branch cleanup | `git branch -a` | only `main` and `origin/main` — every package branch deleted both sides |
| Orphaned processes | `ps aux \| grep -E 'astro\|playwright'` | none (one orphaned `astro preview` from this session's own P5 measurement work was found and killed before this handoff was written) |
| Dependencies | `git diff origin/main~15 origin/main -- package.json` | empty — none added |

## What this session did NOT do

- P5's own reserved decisions (visitor mode per page, whether to restructure `/how-i-build`,
  whether NarraTwin/EvalAxis/Aegis belong on `/cv` at all) — deliberately, per the owner's
  instruction that this needs a real working session.
- P6 — blocked on P5 by the plan's own text.
- Anything beyond gathering P5's groundwork and stopping.
