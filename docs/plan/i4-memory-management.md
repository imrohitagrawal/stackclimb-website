# I-4 — memory management across projects, using "dreaming"

Implements I-4 (`docs/OWNER-DIRECTIVES.md`) and plan phase 7.2: *"Memory consolidation —
enable auto-dream, `git init` the memory dir. Gate: history exists; prune becomes
reversible."* **Plan only, per the standing instruction — nothing built, nothing changed.**

## A conflict raised before complying, not silently resolved

Phase 7.2 says "enable auto-dream" as if it is a switch to flip. Checked before planning
around it (per AGENTS.md's disagree-before-comply rule): **"auto-dream" is not a Claude
Code feature.** Verified against the actual Claude Code docs (`memory.md`, `settings.md`)
— zero references to automatic memory consolidation, pruning, or a scheduled background
process. What exists instead: `/memory` (manual audit/edit), `/compact` (context, not the
memory files), `autoMemoryEnabled`/`autoMemoryDirectory` settings (on/off and location,
not consolidation), and `CronCreate`/hooks (scheduling primitives with no memory-specific
behavior built in). **The everyday analogy**: the plan phase describes a self-cleaning
oven; what actually exists is an oven and a timer — someone still has to write the
cleaning program.

This means I-4 is not "flip a switch" work — it's "design and build a maintenance
process using general-purpose scheduling primitives," a meaningfully bigger and riskier
piece of work than the plan phase's one line suggests, on infrastructure that shapes every
future agent session's behavior across every project, not just this repo's.

## Ground truth, verified by command

| Fact | Command | Result |
|---|---|---|
| This repo's memory dir | `ls .../designing-website/memory/` | 4 files, not yet a git repo (`git status` → `fatal: not a git repository`) |
| "Across projects" is real, not rhetorical | `ls ~/.claude/projects/*/memory` | **10 project memory directories exist**, sizes from 0 to **60 files** (`citevyn`), several well into the dozens (`quorum-ai` 46, `citevyn` 60) — some genuinely large and, by the same logic that applies here, likely carrying stale or superseded entries with no way to see what changed or revert a bad edit |
| None are under version control | spot-checked 3 of 10 | All `fatal: not a git repository` — the "history exists" half of the gate is currently true for **zero** of the ten |
| These directories sit outside this repo | path | `~/.claude/projects/<project>/memory/` — a `git init` here is **infrastructure for the Claude Code harness itself**, not a change to `designing-website`'s own repo, and several of the ten belong to projects entirely unrelated to this one (citevyn, quorum-ai, evalaxis, saaf-saans, project-doc-skills) |

## What "git init the memory dir" concretely buys, and its real cost

**Buys**: every edit becomes a diff, a bad consolidation pass (or a bad manual `/memory`
edit) becomes `git revert`-able instead of permanent, and "what did the agent believe on
date X" becomes answerable. Cheap, mechanical, genuinely reversible itself (a `git init`
with no push anywhere is pure upside, at the cost of one `.git` directory per memory
folder).

**Real cost / risk, stated plainly**: this is **not confined to `designing-website`**. Ten
separate git repositories would be created, nine of them for other projects this session
has no context on and no standing authorization to modify — including projects that may
have their own conventions for what belongs under version control (e.g. `citevyn`'s 60-file
memory store may include entries this session cannot judge the sensitivity of). Doing this
correctly needs, per directory: confirm no secret/credential ever got written into a
memory file (a memory file is prose, not code, and this repo's own PII gate doesn't scan
`~/.claude`), decide whether it commits to a local-only repo (no remote) or something
more, and decide whether `git init` alone is the ask or whether an initial "as-is" commit
capturing today's state is expected too.

## What "dreaming" (consolidation) would concretely require, since nothing built-in exists

A scheduled `claude` invocation (via `CronCreate` or an OS-level cron/launchd job) running
a purpose-written prompt that: reads every memory file in a project's directory, finds
duplicate or superseded entries (the auto-memory system's own stated rule — "do not write
duplicate memories" — is asked for at write-time, not enforced retroactively), proposes
merges/prunes, and commits the result. This is a new skill/prompt to design, not a
setting to enable, and it raises its own real question: should a consolidation pass
**auto-commit** its edits (fast, but an unreviewed automated rewrite of the knowledge that
steers every future session is a meaningfully different risk than an unreviewed automated
rewrite of, say, a CSS file), or should it produce a diff for the owner to review before
it lands?

## Two questions this plan stops at — genuinely the owner's, not implementation detail

1. **Scope**: `git init` only `designing-website`'s own memory directory now (small,
   contained, fully in this session's existing authorization), or all ten (a real,
   cross-project infrastructure change that should be a deliberate yes, not a default)?
2. **Consolidation mechanism, if any is wanted now**: a scheduled, unattended job that
   auto-commits its own edits to memory — or a manual/scheduled job that proposes a diff
   for review before anything is written? (Or: leave dreaming unbuilt for now, and treat
   `git init` alone — "history exists" — as I-4's complete scope for this pass, with
   consolidation logic deferred until enough history exists to show it's actually needed.)

## Not in this package

Any `git init`, any commit, any new skill or scheduled job — this document is the entire
deliverable for this pass, per the standing "plan, then STOP" instruction.

## Decision — 2026-08-26 (D133), recorded for the owner's confirmation

**Question 1 is answered and done for this repo:** its memory folder is a git repo
(`6fb8e95`, 2026-08-18; second commit `fe98f47`, 2026-08-26, carrying that day's edits). The
other nine project folders are untouched — a cross-project change stays the owner's deliberate
yes, as the table above says.

**Question 2 — a consolidation ("dreaming") pass — is decided: not built, and the trigger
that would reopen it is named.** The evidence, three weeks in: this repo's memory holds
**five** files and a **six-line** index. There is nothing to consolidate. Every write so far
has been a deliberate update of an existing file rather than a duplicate, and the one
mechanism the harness actually ships — the size nudge on `MEMORY.md` — has not fired. A
scheduled job that rewrites the knowledge steering every future session, unreviewed, is a
larger risk than the problem it would solve, and the problem has not appeared.

**Reopen when either holds:** `MEMORY.md` passes 25 entries, or a session acts on a memory
that turns out to be wrong (a stale fact that history alone would not have caught). Until
then, `/memory` by hand, with git history making every prune reversible, is the whole
mechanism.

*Raised, not silently decided:* I-4 asked for dreaming by name. The disagreement is with the
premise — the feature does not exist and the need has not shown up — not with the goal.
His word settles it; the register carries the row as decided-pending-confirmation.

## Built — 2026-08-27 (D136)

The owner asked the right question about the decision above — local-only history survives a bad
edit, not a lost machine — and said "go ahead with the recommendation". `~/.claude/projects/` is
now one git repository admitting only `*/memory/**`, backed up to the **private** GitHub repo
`imrohitagrawal/claude-memory` (visibility confirmed by API), gitleaks-scanned before the first
push (one documented placeholder accepted by fingerprint). This repo's two earlier memory commits
are grafted in. Transcripts never enter it. Consolidation stays on demand, by hand.
