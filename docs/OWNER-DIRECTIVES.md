# Owner directives — every instruction, and whether it was honoured

Every instruction the owner gives, recorded so none is dropped. This register exists because
four directives had to be repeated between two and four times before they were honoured.

**It is not a record of orders to obey.** An instruction that contradicts the evidence, the
documented decisions, or my own analysis gets **raised and discussed before any work starts** —
see the "disagree before you comply" rule in `AGENTS.md`. Recording a directive here is not the
same as agreeing with it; the `Contested` column says which were argued, and how they resolved.

**Checked at the start of every session and before every plan.** A directive marked `OPEN` is a
debt, not a suggestion.

Status: `DONE` · `PARTIAL` (started, not finished) · `OPEN` (not started) · `DROPPED` (was
forgotten and later recovered — kept visible on purpose).

---

## Working method

| # | Directive | Status | Where it lives |
|---|---|---|---|
| W-1 | Read the `main` branch, not whatever is checked out | DONE | `AGENTS.md` · `L-PLAN-1` |
| W-2 | Execution is the source of truth, not documentation | DONE | `AGENTS.md` |
| W-3 | Plain English — no jargon, no AI filler, lead with the answer, bullets, examples | DONE | `AGENTS.md` |
| W-4 | Modularize; no file grows unbounded; segregate concerns | DONE | `AGENTS.md` — 250/32k/120 |
| W-5 | Store discussions and outcomes in structured files, not chat | DONE | `docs/STATUS.md` |
| W-6 | Hooks and CI, because a rule that can be evaded is worthless | OPEN | Plan phase 1 |
| W-7 | Plan fully before implementing | DONE | `docs/plan/build-plan.md` |
| W-8 | Never write a skill that already exists in public | DONE | `AGENTS.md` |
| W-9 | Custom skills allowed when a capability is scattered across 3–4 skills | DONE | `AGENTS.md` |
| W-10 | Check skill currency in planning; skills reload only at session start | DONE | `AGENTS.md` |
| W-11 | Session close: summary, merge, cleanup, handoff | DONE | `docs/practices/session-close.md` |
| W-12 | Learnings filed by engineering phase, indexed, not one file | DONE | `docs/learnings/` |
| W-13 | Five definitions: Ready, Developed, Tested, Done, Complete | DONE | `docs/practices/definitions.md` |
| W-14 | PR describes behaviour before and after, exact changes, reviewer focus | DONE | `.github/PULL_REQUEST_TEMPLATE.md` |
| W-15 | **Document and RCA a finding before working on it; get approval first** | OPEN | — |
| W-16 | **Do not drop or forget any instruction** | DONE | This file |
| W-17 | Good practices harvested for reuse on future projects | DONE | `docs/practices/` |
| W-18 | Planning defects cost more than development defects — research deeply, fan out | PARTIAL | 9 agents run; no standing rule yet |

## Review and orchestration

| # | Directive | Status | Where it lives |
|---|---|---|---|
| R-1 | Full expert fan during planning; scale down during development | DONE | `AGENTS.md` |
| R-2 | Always two adversarial reviewers on test changes | DONE | `AGENTS.md` |
| R-3 | Reviewers must **execute**, not read and assume | DONE | `AGENTS.md` |
| R-4 | Circuit breaker — bugs every round means the fault is upstream | DONE | `AGENTS.md` |
| R-5 | `ui-ux-pro-max` as an independent lens, because the builder must not audit itself | DONE | `docs/skills/README.md` |
| R-6 | One agent verifies the live UI image by image, as a user sees it | PARTIAL | Contract + harness exist; the skill does not |

## Product and content

| # | Directive | Status | Where it lives |
|---|---|---|---|
| P-1 | Recapture PRODUCT.md — full re-interview | PARTIAL | Users/purpose/positioning updated; evidence section stale |
| P-2 | Keep availability language; hide only the end goal | DONE | `PRODUCT.md`, `AGENTS.md` |
| P-3 | Add the two extra role titles to Seeking | DONE | `index.astro:48-49` |
| P-4 | Private work framed to show something is being built, without saying what | DONE | Private plate copy |
| P-5 | Extend the plate world rather than replacing it | DONE | Decision D1 |
| P-6 | Per-project facts must differ — not one template | OPEN | Plan phase 3 |
| P-7 | Surface AI-engineering practice: evals, monitoring, observability, roadmap | OPEN | Plan phase 3 |
| P-8 | Show in-progress and roadmap items, not only finished work | OPEN | Plan phase 3 |
| P-9 | Interactive résumé | OPEN | Plan phase 4.4 |
| P-10 | Comments facility, low priority | OPEN | Giscus recommended, not built |
| P-11 | NarraTwin avatar as the site's representative | OPEN | Plan phase 7.3 |
| P-12 | Logo — Claude produces options before opening the owner's | OPEN | Plan phase 5 |

## Infrastructure

| # | Directive | Status | Where it lives |
|---|---|---|---|
| I-1 | Hosting confirmed: Cloudflare Pages + Fly, spend nothing until needed | DONE | Decision D2, D3 |
| I-2 | Repo public after removing playbook language | PARTIAL | Rewording pushed; **owner must run the visibility command** |
| I-3 | Alignment regression testing — a toggle that drifts must fail | OPEN | Plan phase 1.4 |
| I-4 | Memory management across projects, using dreaming | OPEN | Plan phase 7.2 |

---

## Dropped and recovered — kept visible

Instructions that were given and not acted on until the owner repeated them. Recorded because
the pattern matters more than any single miss.

| Directive | Times repeated | What actually fixed it |
|---|---|---|
| Store discussions in structured files | 4 | `docs/STATUS.md`, only after the fourth ask |
| Plain English, no jargon | 2 | A rule in `AGENTS.md`, loaded every session |
| Learnings folder structured by phase | 2 | `docs/learnings/` |
| Plan before implementing | 2 | `docs/plan/build-plan.md` |

**The pattern:** each was fixed only once it became a *file* rather than a *promise*. Nothing
here was solved by intending to remember it.

---

## Contested — raised, discussed, resolved

Where an instruction met evidence that pointed the other way. Kept because the disagreements
produced better answers than either side had alone.

| Instruction | The counter-evidence | Who was right | How it resolved |
|---|---|---|---|
| "A 250-line rule exists in our repos" | A search across the repos found none | **Owner** | The search read feature branches. `ADR/0047:55` on `main` has it. Rule adopted verbatim |
| "The doc skills are useful — did you read them?" | A review reported dangling references | **Owner** | The review read `skills/<name>/`, a build input. `dist/*.skill` is complete. `architecture-and-decisions` is now a top-two install |
| "Use a fan of six role-specific reviewers" | His own repo: a five-lens fan raised 32 findings, 23 refuted. `AGENTS.md` rule 10 says two lenses | **Both, partly** | Full fan for planning; scale to blast radius during development; spend the marginal budget on verification, not more finders |
| "Rules that can be evaded are good for nothing" | His own data: 0 of 16 defects were caught by an automated check; 10 of 16 by adversarial review | **Both** | Mechanise everything mechanisable; stop pretending the rest is covered. Gates prevent repeats; review finds new defects |
| "Install `security-and-hardening`" | Five of its six sections are server-side; this site has no server | **Claude** | Skipped. The five applicable supply-chain rules copied into `AGENTS.md` instead |
| "The repo has a LICENSE file" | Only `examples/doc-critic-demo/LICENSE` exists; the API reports none | **Claude** | `shared/licensing-and-credits.md` licenses the *output*, not the skills. A root LICENSE is still needed |

## Still unanswered by me

Named so they are debts, not omissions.

| Question | State |
|---|---|
| Do the doc skills ground answers in fetched documentation? | Partially checked — hit counts only. Not answered |
| What orchestration practice am I following? | Not answered |
| Is anything else pending on the owner? | Not answered |
