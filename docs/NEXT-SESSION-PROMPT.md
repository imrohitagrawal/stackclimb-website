# Next session — Giscus (4-of-4), then P-7 (major, fresh-context), then a full open-items audit

You are continuing work on stackclimb.com, the owner's personal site.
`/Users/rohitagrawal/Projects/designing-website`. Astro, static, Cloudflare Pages.
DEPLOYMENT IS APPROACH C: a merge to main deploys automatically through CI and verifies
production itself (gates.yml deploy job). Never run manual wrangler unless the CI deploy
job fails — break-glass only. **W-24 (owner, 2026-08-15): merge each PR autonomously once
it is verified and green — the merge is delegated, owner-reserved judgment calls are not.**
**That delegation covers the MERGE step only. It does NOT cover deciding what the site
claims about the owner or his practice (P-18) — see Task 2 below before you write a word
of new site copy.**

READ FIRST, IN THIS ORDER, AND DO NOT SKIP:
  AGENTS.md · `docs/STATUS.md` (D100 down through D95, most recent first) ·
  `docs/OWNER-DIRECTIVES.md` (checked at the start of every session, per its own rule — an
  `OPEN` row is a debt).

THEN STOP TRUSTING THEM. Verify by running a command before acting on any row. The ledger
outranks this file, and this file is itself already a few hours old by the time you read it.

## What the prior session did — a pointer, not a copy

`docs/STATUS.md` rows **D99** and **D100** are the record. In one sentence each: D99 closed
W-6/M4 (the agent-side `Stop` hook was laptop-only in gitignored `settings.local.json`; moved
to tracked `.claude/settings.json`). D100 closed W-19 (a `review-synthesizer` skill), W-23 (an
8-role plan-review menu at `docs/practices/plan-review-roles.md`), and R-6 (a packaged
`visual-review` skill). Both PRs merged under W-24, both deploy jobs ran green, both
independently re-verified against production directly:

```bash
curl -sL -o /dev/null -w "%{http_code}\n" https://www.stackclimb.com/                     # 200
curl -sL -o /dev/null -w "%{http_code}\n" https://www.stackclimb.com/projects/narratwin    # 200
curl -sL https://raw.githubusercontent.com/imrohitagrawal/stackclimb-website/main/docs/STATUS.md | grep -c "^| D100 "  # 1
```

I-4 (memory management) was resolved for its first question: this repo's own memory folder
(`~/.claude/projects/-Users-rohitagrawal-Projects-designing-website/memory/`) was `git init`'d
and given one baseline commit, owner-scoped to this repo only — the other 9 project memory
folders on the machine were deliberately left alone (cross-project change, never authorized).
No "dreaming" consolidation job was built — Claude Code's own docs describe a real, already-
built size-triggered pruning nudge on `MEMORY.md`, so there is currently no evidence a new
scheduled job is even needed. Don't re-build this unless new evidence says otherwise.

## Task 1 — Giscus: verify the real count first, then close whatever gap actually exists

The owner installed the giscus GitHub App this session. A live check at the time found only
**1 of 4** project pages had an actual GitHub Discussion thread (`narratwin`, `discussions/51`)
— the other 3 (`citevyn`, `quorum`, `saafsaans`) had none, because the `Announcements` category
only lets the repo owner start a *new* thread; visitors can only reply to one that exists.

**Do not assume "3 of 4" is still true — re-verify before touching anything:**

```bash
gh api graphql -f query='{ repository(owner: "imrohitagrawal", name: "stackclimb-website") {
  discussions(first: 20) { totalCount nodes { title category { name } number url } } } }'
```

Cross-check the titles returned against the site's real slugs — confirmed as `citevyn`,
`quorum`, `saafsaans`, `narratwin` (`src/data/project-pages.js`, checked, not guessed).

For every slug with no matching thread:

1. **Ask the owner to seed it himself first** — one visit to the page, signed into GitHub, one
   comment. Keeps the thread opener in his own voice, and needs no code or API write.
2. Only if he'd rather it be automated: creating the Discussion directly via a `gh api graphql
   createDiscussion` mutation is possible (category id `DIC_kwDOTzbbEs4DDj8g`, title = the
   slug, matching `data-mapping="specific"` + `data-term`) — but this posts public content
   under his GitHub identity. **Ask before doing this even though W-24 covers merges** — W-24
   delegates merging verified code, not authoring public content in his name.

Once all 4 exist, re-run the same GraphQL query and confirm `totalCount` and all 4 slugs are
present — independently, not by trusting the widget rendering once. If nothing in the repo's
own code changed (pure GitHub-side content), one `docs/STATUS.md` row documenting it is enough
— no PR needed. If P-10's row in `docs/OWNER-DIRECTIVES.md` still says "one owner step
outstanding," close it in the same change.

## Task 2 — P-7: AI-engineering practice, done properly, fresh context, major item

This is the big one. Do not compress it into a quick pass. P-7's row already names the exact
gap: `/how-i-build` (D88) covers general CI discipline but not evals/observability specifically,
and a roadmap is deliberately absent sitewide (P-8's own ruling: an undated roadmap is a barred
claim class). This task is: research what real, evidenced AI-engineering practice looks like at
mature product companies, audit which of it the owner's own repos already demonstrate, find the
honest gaps, and — only after his sign-off — put the verified list on the site.

### The review fan — sized to what THIS task needs, not a stock roster

Per AGENTS.md's own rule (size the fan to the phase — full fan for planning, scaled down for
build): this is squarely a planning-and-research phase, so it earns a real fan. Four seats,
each justified by what P-7 specifically asks for — do not pad this by default, and do not
shrink it to save time either:

- **AI Principal Staff Engineer** — separates real engineering discipline (testing, CI, evals,
  monitoring) from language that only sounds like it.
- **AI Engineering Manager** — checks whether the resulting list is something a real AI eng org
  would recognize as "yes, that's how mature teams work," not a generic checklist a search
  engine would also produce.
- **AI Principal Architect** — checks that every listed practice maps to a real, verifiable
  artifact in a specific repo (a config file, a gate, a workflow, an eval script) — an assertion
  with no artifact does not survive this lens.
- **AI Evals/Observability Specialist** — P-7's own row names this as the specific hole
  (`/how-i-build` doesn't cover it), so it gets a dedicated lens instead of being folded into
  the architect's pass.

Add a fifth seat only if the research phase surfaces a concrete reason (e.g., a safety/red-team
angle if the evals research turns one up) — and say so explicitly if you do, so it's a decision,
not fan creep.

### Step order — do not skip or reorder any of these

1. **Research industry practice for real.** Use WebSearch/WebFetch against real, named sources
   — engineering writeups from Anthropic, Google, OpenAI, established MLOps/evals frameworks,
   DORA-style metrics adapted for AI systems. Every practice that ends up on the site must trace
   to a real source, quoted or linked — this repo's "no claim without a check" rule applies to
   research citations exactly as it applies to everything else here.
2. **Survey every one of the owner's own repos that's actually accessible — verify each path
   before claiming anything about it, don't assume last session's finding still holds:**
   `~/Projects/citevyn` · `~/Projects/quorum-ai` · `~/Projects/saaf-saans` AND
   `~/Projects/saafsaans` (both directories exist on this machine — check `git remote -v` in
   each to find out which is the real, current repo before citing either; do not guess) ·
   `~/Projects/narratwin/narratwin-ai` · `~/Projects/evalaxis`. Aegis Contracts was found not
   locally cloned as of P-14 (D80/D83) — re-check fresh (`ls ~/Projects/aegis* 2>&1`), don't
   assume that's still true. For every repo you can actually read, ground each "practice already
   followed" claim in a real file and line — a CI config, a golden-set test, a gate, an eval
   script, an observability hook. No claim without the artifact behind it.
3. **Produce the gap list, two columns**: practices verified already in place (repo + file +
   line proving it) — and practices the research found as standard-but-missing here. Label
   anything genuinely uncertain as uncertain; don't round it up to a claim.
4. **Write the plan/RCA before building anything.** Per AGENTS.md's non-negotiable order:
   investigate → write it up → state the need → get approval → then build. **This step cannot
   be skipped for P-7 specifically, even under W-24**: the output is a public claim about the
   owner's own practice and self-image (P-18: "decisions altering facts, self-descriptions or
   claims remain his"). Stop here and present the draft findings plus the proposed page copy to
   the owner. Do not write a line of live site content, and do not open a PR containing new
   claims, before he has signed off on exactly what it says.
5. **Only after his sign-off on the actual wording**: build it (most likely extends
   `/how-i-build` — verify its current structure fresh before assuming it is unchanged from
   D88), gate the new claims the way this repo already gates claims (`docs/evidence/`,
   `tests/dod.spec.js`-style checks — match the existing pattern, don't invent a new one), update
   the ledger in the same change, then the normal flow: branch → PR → review (max 2 rounds,
   circuit-breaker rules apply exactly as elsewhere in AGENTS.md) → gates green → **owner-
   authorized** merge → deploy job verified green → production independently re-checked by
   direct command, not by trusting CI's own report.

## Task 3 — A full, verified open-items audit, with P-1 and P-12 named explicitly

Do this alongside Task 2's research phase, not instead of it. Sweep every row of
`docs/OWNER-DIRECTIVES.md` and `docs/STATUS.md` and check each one against real repo state —
read-and-repeat does not count as an audit. In the report back to the owner, explicitly name:

- **P-1** — `PRODUCT.md`'s evidence section is stale; still open, no work started on it.
- **P-12** — the logo process miss (a candidate-options step was skipped); nothing to build,
  it's a recorded lesson, but it must stay visible, not get quietly dropped from the register.
- Every other PARTIAL, OPEN, or off-legend status row found — report its real current status,
  not just these two.

Close the report with one paragraph, not a table: given everything genuinely open, what is the
single highest-value next thing to work on after P-7, and why.

## How to work (durable lessons, unchanged from prior sessions)

  - ONE WRITER. Fan reviews, never construction. NEVER edit the tree while a fan runs.
  - Verify by running a command before stating a fact as settled. Two sessions running now have
    proof of this: the P-11 investigation (three "obvious" readings, each false on the first
    real check) and this session's giscus count (assumed 4-of-4-installed meant 4-of-4-working;
    the real blocker was thread creation, found only by querying the Discussions API directly).
  - Raise a conflict before complying, with evidence and a position, not a silent guess.
  - Background subagents can go idle waiting on their own monitor after CI has already gone
    green — check `gh pr checks <n>` yourself before assuming a "still waiting" report is
    current; nudge or take over the merge directly if it's stale.
  - Close the session properly: summary with numbers, main level with origin, branches deleted
    both sides, ports free, tree clean, fresh handoff here.

## Claims that must never ship

Everything in the standing live sweep (D85/D87), plus: never "self-reported" (P-16, any folded
spelling) · never "product studio" (D62) · never "No-Go"/"not deployed" on the #proof act
(P-17) · never "Oracle tenure" on the act (P-21) · never an employer name ANYWHERE in the act
(gated, derived from cv.js orgs) · never a dated span the rows cannot evidence · never
"cross-model critique" (quorum's evidence prescribes "moderated critique") · never "pre-1.0"
for EvalAxis ("private, in progress") · SaafSaans labels are "live, cached, or no reading" ·
the thesis says FOUR · never claim NarraTwin is deployed or its release-readiness has changed
without re-verifying against `origin/main` first · never claim or fabricate an avatar/video of
the owner from NarraTwin — none exists (D97). **New for P-7 specifically: never present a
practice as "in use" anywhere in this list without the repo+file+line that proves it — this is
exactly the class of claim the rest of this file already bars everywhere else on the site.**

## How to write to the owner

Plain English. Lead with the answer; if it is no, the first word is no. Short sentences,
bullets, a concrete example. No jargon, no AI filler. Never re-explain what he has acted on.
Disagree out loud BEFORE complying when evidence contradicts an instruction — conflict,
evidence, your position, an everyday analogy.
