# Evidence base

Source material for stackclimb.com, gathered by reading the project repositories directly
rather than their READMEs. Everything the website claims should trace to a line in here.

## Why this exists

Site copy must state what is proven and label what is not. That is only possible if the
underlying facts are recorded with their provenance attached. A claim without a status
below is not ready to go on the site.

## Status legend

Every claim in these files carries one of:

| Status | Meaning |
|---|---|
| `VERIFIED` | Read directly in code, config, or CI. Cite the file path. |
| `REPORTED` | Stated in the project's own README or docs. Plausible, not independently checked. |
| `UNVERIFIED` | Believed but not yet checked. **Must not appear on the site** until promoted. |
| `REFUTED` | Checked and found false. Kept so the mistake is not repeated. |

## Files

One concern per file; no file over 200 lines. A parent indexes and links, it never restates.

| Path | Covers | State |
|---|---|---|
| `recognition.md` | The awards on `/cv` — provenance per entry | **written 08-27**; one `VERIFIED`, four `UNRECORDED` (DEF-75) |
| `practice/` | Cross-cutting practice — skill library, cross-review, CI discipline, failure-driven engineering | 4 files written |
| `projects/citevyn.md` | CiteVyn | **written 08-11**, measured at `df8cfc3` |
| `projects/quorum-ai.md` | Quorum-AI | **written 08-11**, measured at `d3c860c` |
| `projects/saafsaans.md` | SaafSaans | **re-measured 08-14 at `10f4213`** (origin/master); 08-11 section at `667397a` kept, superseded |
| `projects/narratwin.md` | NarraTwin | **re-measured 08-14 at `a022862`** (origin/main); the 08-11 REFUTED table is inverted — see its correction section |
| `projects/private.md` | EvalAxis, Aegis Contracts | **EvalAxis re-audited 08-14 at `c3233de`** — line figure corrected to 12,978; Aegis not cloned |

`practice.md` at this level is a superseded pointer stub, kept so old links resolve.

## Method

Repositories live as siblings in `~/Projects`. Read in this order, because thinking lives
further down than most people look:

1. `.github/workflows/` — what actually gates a merge. The truest signal of practice.
2. `docs/` — architecture decisions, specs, case studies.
3. `.agents/skills/` and `.claude/skills/` — the authored engineering practice.
4. `AGENTS.md`, `CLAUDE.md` — how the agents are instructed.
5. Source — only to confirm or refute a specific claim.

## Mistakes caught so far

Recorded because the failure mode is instructive, not because it is embarrassing.

- **"CiteVyn uses Arize"** — `REFUTED`. A grep for `arize` returned 27 hits; all 27 were the
  word **"summarize"**. Substring matches are not evidence. Confirm the token before believing it.
- **"NarraTwin uses RAGAS"** — `REFUTED`, and the truth is better. See `narratwin.md`.
- **"CiteVyn self-hosts Postgres and Redis"** — `REFUTED`. Both are managed free tiers
  (Neon, Upstash). PRODUCT.md still carries the wrong version.
- **"CiteVyn: retrieval hit-rate 1.0 over 54 cases"** — `REFUTED`. 54 is the *judge* count;
  hit-rate 1.0 is over **26 answerable** cases. Two scopes in one file, and conflating them
  more than doubles the claimed scope of a real result.
- **"NarraTwin: answerRelevancy 0.903, contextRecall 0.75"** — `REFUTED`. The committed
  `docs/EVAL_REPORT.md` records **1.0** for both. The lower figures came from a research
  subagent reading a JSON in a worktree that has since been deleted; most likely a different,
  newer run, and now unrecoverable. **An inherited claim is assumed until re-measured — even
  when the source is your own agent and even when it cited a path.**
- **"Aegis Contracts has no repository"** — `REFUTED`. It exists and is private; it is simply
  not cloned locally. "Not cloned" and "does not exist" are different facts, and only one of
  them had been checked.
