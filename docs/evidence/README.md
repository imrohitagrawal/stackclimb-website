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
| `practice/` | Cross-cutting practice — skill library, cross-review, CI discipline, failure-driven engineering | 4 files written |
| `projects/citevyn.md` | CiteVyn | not yet written |
| `projects/quorum-ai.md` | Quorum-AI — 139 docs unmined | not yet written |
| `projects/saafsaans.md` | SaafSaans | not yet written |
| `projects/narratwin.md` | NarraTwin | not yet written |
| `projects/private.md` | EvalAxis, Aegis Contracts | not yet written |

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
