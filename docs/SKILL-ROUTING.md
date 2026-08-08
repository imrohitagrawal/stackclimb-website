# Which skill, for which job

**45 skills are installed.** Nobody can hold that in their head, and a skill nobody invokes is
dead weight. This file is the routing table: *given this task, reach for this skill.*

Read it before starting work. If a task below has a named skill and you did not use it, say why
in the report — "the owner had to tell me twice to use the skills that are installed" is already
a recorded learning (`docs/learnings/review.md`, L-REV-3).

---

## Routing table

| When the task is… | Use | From |
|---|---|---|
| **Deciding what the site should SAY** — headline, tagline, one-liner | `brand-messaging` | arnabbagxd |
| **Deciding where he SITS** — differentiation, what he owns, competitive space | `brand-positioning` + `brand-strategist` | arnabbagxd + borghei |
| **Writing the "why I exist" / About narrative** | `brand-story` | arnabbagxd |
| **Deciding how the copy SOUNDS** — tone, vocabulary, what the site never says | `brand-voice` | arnabbagxd |
| **The `/cv` page for senior/principal roles** | `executive-resume-writer` | Paramchoudhary |
| **Making that CV read as engineering, not management** | `tech-resume-optimizer` | Paramchoudhary |
| **Turning a vague claim into a measured one** | `resume-quantifier` | Paramchoudhary |
| **Turning a project plate into a real case study** | `portfolio-case-study-writer` | Paramchoudhary |
| **Testing the positioning against real job posts** | `job-description-analyzer` | Paramchoudhary |
| **Adding or fixing motion** | `improve-animations`, `find-animation-opportunities`, `animation-vocabulary`, `review-animations` | emilkowalski |
| **Building or refining a UI surface** | `/impeccable shape` → build → `/impeccable polish` | pbakaus |
| **Scoring the design** | `/impeccable critique` (dual-agent) | pbakaus |
| **a11y, performance, responsive** | `/impeccable audit` | pbakaus |
| **Interrogating a claim before building on it** | `grilling` + `domain-modeling` | Matt Pocock |
| **Generating options rather than one answer** | `brainstorming` | obra |
| **Before calling anything done** | `verification-before-completion` | obra |
| **Reviewing code** | `code-review-and-quality`, `requesting-code-review`, `receiving-code-review` | addyosmani, obra |
| **A bug whose cause is not obvious** | `systematic-debugging` | obra |
| **Any behavioural change with a test harness** | `test-driven-development` | obra |
| **Fanning out reviewers** | `dispatching-parallel-agents` | obra |
| **Cross-model review (mandatory on test changes)** | `codex exec --sandbox read-only "<prompt>"` | OpenAI Codex CLI |

---

## The three added on 9 August, and why each won

Full search record, including what was rejected, is in `docs/positioning-decisions.md` §8.

### `arnabbagxd/Brand-building-skills` — 482★, MIT

Four skills: `brand-positioning`, `brand-messaging`, `brand-story`, `brand-voice`.

**Why.** It has real anti-patterns, which is this project's bar for a skill —
*"Positioning that could apply to any competitor in the category"*, *"A differentiator that's a
table stake"*, *"Positioning the brand can't substantiate with proof points"*. The third is this
site's own thesis stated back at it.

**Its recorded weakness:** it cites **no established framework** — no April Dunford, no Geoffrey
Moore. By this project's own rule that makes it evidence of practice, not a source of authority.
**Mitigation: never run it alone.** Pair it with `grilling`, which interrogates a claim rather
than accepting it, and with `brand-strategist` below, which supplies the framework it lacks.

### `borghei/Claude-Skills` — 464★, **Commons Clause + MIT**

One skill: `brand-strategist`. Taken specifically because it cites **April Dunford**, the actual
authority on positioning, which is the gap in arnabbagxd.

**Licence care:** Commons Clause restricts *selling* the software. Internal use is fine.
**Do not describe it as MIT and do not redistribute it.**

### `Paramchoudhary/ResumeSkills` — 1,477★, MIT

Five of its 22 skills, listed in the table above. This is the CV work under D31.

**Deliberately not taken:** `career-changer-translator`. Its worked examples are
Teacher→Corporate and Military→Corporate. The owner's move is a *specialisation shift inside one
industry*, and the skill would over-apply.

---

## Rejected, with the reason, so they are not re-proposed

| Candidate | Why not |
|---|---|
| `coreyhaines31/marketingskills` — **43,542★**, MIT, known author | **Not one of its 50 skills covers positioning or messaging.** All tactics: ads, SEO, email, CRO, pricing. Stars are not relevance |
| `wonjyou/portfolio-review-skill` — 5★, **no licence** | The single closest match to the 30-second test: it reviews a portfolio URL as a hiring manager at a stated seniority. **No licence means all rights reserved**, and `.claude/` is tracked here, so installing it would commit it. **Read it and credit it; do not vendor it** |
| `MadeByTokens/resume-helper` — 6★, MIT | Philosophically the closest thing to how this project already works: four adversarial agents — Writer, Fact-Checker, Interviewer, Coach — aiming at resumes that are compelling **and** honest. Six stars. The shape is right; revisit if it grows |
| `brand-guidelines` (in **both** new brand repos) | **Collision.** One would silently overwrite the other — the same trap the two TDD skills sprang here before. Taken from neither |

---

## Rules that override any of the above

- **A skill is authority only if its provenance is external.** Skills an agent wrote here are
  evidence of practice, never a source of rules.
- **Prefer skills that say how, where, where NOT, and what not to do.** One that only lists what
  to do is close to worthless.
- **Skills load at session start.** One installed mid-session is not active in that session.
- **Currency is checked during planning, never during implementation.** `npx skills update`,
  verify against `skills-lock.json`, record versions in `docs/STATUS.md`, then restart.
