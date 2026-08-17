# Next session — nothing queued (the register was fully worked as of D98)

You are continuing work on stackclimb.com, the owner's personal site.
`/Users/rohitagrawal/Projects/designing-website`. Astro, static, Cloudflare Pages.
DEPLOYMENT IS APPROACH C: a merge to main deploys automatically through CI and verifies
production itself (gates.yml deploy job). Never run manual wrangler unless the CI deploy
job fails — break-glass only. **W-24 (owner, 2026-08-15): merge each PR autonomously once
it is verified and green — the merge is delegated, owner-reserved judgment calls are not.**

READ FIRST, IN THIS ORDER, AND DO NOT SKIP:
  AGENTS.md · `docs/STATUS.md` (D98 down through D95, this session's work, most recent
  first) · `docs/OWNER-DIRECTIVES.md` (checked at the start of every session, per its own
  rule — an `OPEN` row is a debt).

THEN STOP TRUSTING THEM. Verify by running a command before acting on any row. The ledger
outranks this file.

## What this session did — a pointer, not a copy

`docs/STATUS.md` rows **D97** and **D98** are the record. In one sentence: P-11 ("NarraTwin
avatar as the site's representative") was investigated, not guessed — every candidate
reading was checked against NarraTwin's own repo and came back verified-blocked (production
No-Go, no avatar of the owner exists and is deliberately out of Cut 1 scope per that repo's
own ADR-0054, and the fallback of showing NarraTwin's real Meera artefact is blocked by that
repo's own `presenter_registry.json` setting `publication_allowed: false`). The owner's final
ruling: mark it in progress against NarraTwin's own Cut 1 milestone, register only, no site
change. Two PRs shipped it: **#48** (the P-11 investigation and ledger update) and **#49**
(D98, its own deploy record) — both merged under W-24, both deploy jobs ran green, both
independently re-verified against production directly (not by trusting CI's own check):

```bash
curl -sL -o /dev/null -w "%{http_code}\n" https://www.stackclimb.com/          # 200
curl -sL -o /dev/null -w "%{http_code}\n" https://www.stackclimb.com/projects/narratwin  # 200
curl -sL https://raw.githubusercontent.com/imrohitagrawal/stackclimb-website/main/docs/STATUS.md | grep -c D98  # 2
```

**No code, test, or visible site content changed this session.** This was a ledger-only
close-out — the docs blast radius (T0), self-verified, no plan-review fan or R-7 Codex pass
needed because nothing was built.

## The queue is empty

Plan phase 7 (`docs/plan/build-plan.md`) had one open item, P-11, and it is now IN PROGRESS
per the owner's own ruling, not something for a future session to re-decide. **Do not
re-open P-11's reading question — it is settled and recorded (D97).** If NarraTwin's own
Cut 1 status changes, that is a fact to re-check (`git -C
~/Projects/narratwin/narratwin-ai/narratwin-ai fetch origin && git show
origin/main:docs/RELEASE_READINESS_REVIEW.md | head -15`), not a reason to re-litigate the
scope decision.

## One real open item, carried forward, not dropped

**I-4 (memory management across projects)** is still `PLANNED, awaiting owner decision` —
`docs/plan/i4-memory-management.md`, two questions genuinely his: (1) `git init` scoped to
this repo's own memory dir only, or all ten found under `~/.claude/projects/*/memory`; (2)
if a consolidation ("dreaming") pass is wanted, should it auto-commit its own edits or
produce a reviewable diff first. Check `docs/OWNER-DIRECTIVES.md` I-4's row fresh — if the
owner has answered since this was written, act on the answer; if not, it is still not yours
to decide silently.

## If the owner adds nothing new

There is no standing work. Do a quick health check (`gh pr list`, `git log
origin/main..HEAD` should be empty, `curl -I https://www.stackclimb.com/` → 200) and report
quiet, rather than inventing work. `docs/OWNER-DIRECTIVES.md`'s other `PARTIAL` rows (W-6's
agent-side Stop hook, W-19's synthesizer, W-23's remaining reviewers, P-1's evidence
section, P-7's evals/observability coverage, R-6's skill) are real but not urgent — surface
them if asked what's left, don't start them unprompted.

## How to work (durable lessons, unchanged from prior sessions)

  - ONE WRITER. Fan reviews, never construction. NEVER edit the tree while a fan runs.
  - Verify by running a command before stating a fact as settled — this session's own
    P-11 investigation is the proof: three separate "obvious" readings each turned out
    false on the first real check (`git ls-tree`, an ADR, a registry `permission` block).
  - Raise a conflict before complying, with evidence and a position, not a silent guess —
    the "show Meera" fallback was the owner's own idea and still got checked and killed by
    a registry flag rather than built on trust.
  - GitHub's API (both GraphQL and REST write paths) had a transient outage mid-session —
    503s on `gh pr create`/`gh pr merge` while reads kept working. The fix was retry with a
    short backoff, or fall back to `gh api -X POST/PUT` directly. Not a repo problem; don't
    debug this repo's config if it recurs, just retry.
  - Close the session properly: summary with numbers, main level with origin, branches
    deleted both sides, ports free, tree clean, fresh handoff here.

## Claims that must never ship

Everything in the standing live sweep (D85/D87), plus: never "self-reported" (P-16, any
folded spelling) · never "product studio" (D62) · never "No-Go"/"not deployed" on the
#proof act (P-17) · never "Oracle tenure" on the act (P-21) · never an employer name
ANYWHERE in the act (gated, derived from cv.js orgs) · never a dated span the rows cannot
evidence · never "cross-model critique" (quorum's evidence prescribes "moderated
critique") · never "pre-1.0" for EvalAxis ("private, in progress") · SaafSaans labels are
"live, cached, or no reading" · the thesis says FOUR · never claim NarraTwin is deployed or
its release-readiness has changed without re-verifying against `origin/main` first · never
claim or fabricate an avatar/video of the owner from NarraTwin — none exists, and D97
records exactly why building one would violate that repo's own consent-scope decision.

## How to write to the owner

Plain English. Lead with the answer; if it is no, the first word is no. Short sentences,
bullets, a concrete example. No jargon, no AI filler. Never re-explain what he has acted
on. Disagree out loud BEFORE complying when evidence contradicts an instruction — conflict,
evidence, your position, an everyday analogy. This session's proof it works: the "show
Meera" fallback was raised, checked, and found blocked by that repo's own data before a
single line of site code was touched.
