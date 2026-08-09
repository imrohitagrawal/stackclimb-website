# Phase 0 — the copy, tested rather than assumed

Written 2026-08-09, overnight session. **This is the Phase 0 gate.** Phase 1 may not start until
the copy below is written down.

`docs/positioning-decisions.md` is the 08 Aug record, made **before** any positioning skill was
installed. D33 says so in as many words: *"Every recommendation made on 08–09 Aug is unaided
judgement, not skill-validated… Phase 0 exists to test them and some may not survive it."*

This file is that test. Method: `brand-positioning` (arnabbagxd, MIT).

> **Correction, 2026-08-09.** This line originally read *"paired with `grilling` (Matt Pocock)"*.
> **`grilling` was never invoked.** The adversarial pass below — testing the headline against the
> skill's own red flags, arguing the opposite case, and demanding an everyday analogy — was done
> inline and then described as the skill. That is a claim about method that the method did not
> support, in a document written for a site whose entire subject is claims that survive a check.
> The owner caught it by asking. The analysis stands on its own evidence; the provenance
> sentence did not, and is now accurate.
>
> The mitigation the original sentence was reaching for is still **owed**, not done:
> `brand-positioning` cites no established framework — no April Dunford, no Geoffrey Moore — and
> by this project's own rule (`positioning-decisions.md:196`) it is evidence of practice, not a
> source of authority. Running `grilling` against §03 and §04 is the first Phase 0 task left.

**Verdict up front:** the headline survives. The **lede does not**, and the reason is the
strongest finding of the session — his fourteen years are being treated as a liability to be
outgrown, when they are the moat.

---

## 01 — The category, challenged

| | |
|---|---|
| **Stated category** | Independent AI engineer. Portfolio of four AI systems |
| **Actual category** *(what he is compared against)* | Candidates for one Senior/Principal AI Platform req. That shortlist is: ML engineers with 5–8 years who have shipped models; infra/platform engineers pivoting into AI; and research-adjacent people |
| **The default skeptical read** | "Quality engineer who did some LLM side projects." `PRODUCT.md:32` names this exact risk and the site does not yet answer it |
| **Opportunity category** | **AI evaluation and release governance** — deciding whether a model change is good enough to ship, and building the gate that enforces it |

**Recommendation: the opportunity category.** It is the only one of the three where fourteen
years of release governance is a *qualification* rather than a preamble.

---

## 02 — Where the competition actually sits

Two axes that decide this shortlist:

- **Axis 1 — Builds models ←→ Builds the systems around models**
- **Axis 2 — Ships it ←→ Proves it is safe to ship**

| Who | Where they sit | What they own |
|---|---|---|
| ML/AI engineers, 5–8 yrs | Builds models · Ships it | Model quality, fine-tuning, retrieval accuracy |
| Platform engineers pivoting in | Builds systems · Ships it | Serving, cost, latency, orchestration |
| Research-adjacent | Builds models · Proves it | Benchmarks, papers, offline evaluation |
| **Rohit** | **Builds systems · Proves it is safe to ship** | **Empty. Nobody is standing here** |

The bottom-right quadrant is unclaimed because it needs two things that rarely co-occur: recent,
hands-on LLM system building **and** a decade of production release governance. The market is
short of exactly this — "our AI demo worked and the release did not" is the defining operational
failure of the current cycle, and it is a gating problem, not a modelling problem.

---

## 03 — The territory

**The space.** The person who can tell you whether your AI is actually good enough to ship — and
build the gate that enforces the answer.

**The audience owned.** A team whose AI features already work in a demo and keep breaking, or
quietly degrading, in production.

**The moat.** It cannot be copied quickly from either side. An ML engineer needs a decade of
release-governance scar tissue to earn it; a platform engineer needs to have actually built
LLM systems with evaluation gates in them. He has both, and — this is the part that matters —
**four of his six systems are literally gates**: CiteVyn's 52-case golden gate blocks index
promotion, NarraTwin's readiness review is holding at No-Go, EvalAxis fails CI on a quality
regression, Quorum approves cost before executing. That is not a portfolio of AI demos. It is
a portfolio of *refusals*, which is a far rarer thing to be able to show.

---

## 04 — Positioning statement

> For engineering leaders whose AI features work in the demo and not in the release, **Rohit
> Agrawal** is the principal engineer who builds the evaluation gates that decide what ships —
> because he has spent fourteen years on release governance and every system he has built since
> is a gate.

**Strategic (internal):** Own AI release governance. Fourteen years of production quality
engineering is not the thing he is moving away from; it is the thing that makes the AI work
credible.

**Human (public-facing):** *If your AI features work in the demo and not in the release, we
should talk.* — **the owner's own sentence**, and after testing it is the sharpest asset on
record. It belongs on the site.

---

## 05 — Proof points

Every one is already on the site or one command away. None needs writing.

| # | Proof | Where it is checkable |
|---|---|---|
| 1 | A release gate that has actually blocked something | CiteVyn — 52/52 golden cases, blocks index promotion. `citevyn/backend/artifacts/golden_report.json` at `df8cfc3` |
| 2 | A gate he has let hold against his own interest | NarraTwin — `Phase 1 — No-Go`, undeployed, and shown anyway |
| 3 | A system whose entire job is blocking bad releases | EvalAxis — fails CI on a quality regression against committed baselines |
| 4 | Refusal designed in as a feature | CiteVyn refuses where no indexed source supports an answer |
| 5 | Fourteen years of the same discipline before AI | Oracle Principal MTS, Apr 2019 – Apr 2026; mentored 11+ engineers. **Self-reported** |

Proof 2 is the strongest and the site under-uses it. Almost nobody will show you a project they
decided not to ship. It is the single most credible thing on the page.

---

## 06 — What this refuses to be

- Not for anyone who wants a model trained. He builds the systems and gates around models.
- Never competes on being the fastest to ship a demo. The whole position is the opposite.
- Does not try to be a researcher. No papers, no benchmarks, and the site should never imply any.
- Not a test lead — and equally, **not someone hiding that he ran quality engineering.** Both
  readings are wrong; see the finding below.

---

## 07 — In one sentence

> A principal engineer who builds AI systems that gate themselves — and fourteen years of release
> governance behind the reason they do.

---

## The finding: the site is minimising its own moat

**This is the item worth the owner's attention.**

D26 decided that *"shift-left by default, shift-right by design"* leaves the hero, because it is
QA vocabulary that would "mis-bucket him as a test lead in a thirty-second skim." **That decision
is right about the phrase and wrong about the conclusion drawn from it.**

The phrase should go. But the site went further and now describes fourteen years as *"fourteen
years across distributed systems and production reliability"* — a preamble to the real work,
which is presented as starting in April 2026. Read cold, that says: *career changer, eight months
in.* That is the weakest possible reading of the strongest fact he has.

The authoritative CV disagrees with the site about who he is. `Rohit_V3` opens:

> Quality Engineering Leader | Engineering Manager | Principal AI Quality Engineering Architect |
> AI Test Automation & Agentic AI Leader | Principal Software Engineer

Five titles, quality-first. The site's headline is AI-systems-first. Both are avoiding the
synthesis, from opposite directions. The synthesis is the position in §03: **the AI work and the
quality work are the same skill, and the market has a shortage of it.**

**Everyday analogy, as `AGENTS.md` requires.** A structural engineer spends fourteen years
signing off whether buildings are safe to occupy, then starts building with a new material.
He can either bury the fourteen years and present as a novice in the new material, or say the
true and much stronger thing: *the new material is going up everywhere and almost nobody knows
how to certify it — I have been certifying buildings for fourteen years.* The site is currently
doing the first.

### What this changes, concretely

| Item | Before | After | Status |
|---|---|---|---|
| Headline (D23) | "AI systems that show their work and refuse to fake it" | **Unchanged — it survived the test** | Kept |
| Lede | "…fourteen years across distributed systems and production reliability, **now** building…" | Fourteen years reframed as the reason the AI work is credible, not as the thing before it | **Changed** |
| `Seeking` | Five job titles | One | **Changed** |
| Contact line | "Open to senior and principal roles in…" | The owner's demo-vs-release sentence | **Changed** |
| Shift-left phrase | In the hero | Moves to `/approach` per D26 | Unchanged |

### Why the headline survives

Tested against the skill's own red flags:

- *"Could apply to any competitor"* — **partial fail.** "Shows its work" is drifting toward a
  table stake; every RAG product claims citations now.
- *"A differentiator that's a table stake"* — **partial fail**, same reason.
- *"Cannot be substantiated with proof points"* — **strong pass.** Five proofs above, each with
  a file at a commit.

It is kept because it is his own line, it is provable, and — decisively — **"refuse to fake it"
is the half that is not a table stake.** Nobody else's marketing says their system refuses.
The weakness is real but sits in the first half, and the fix is the lede carrying the position,
not a new headline. Replacing an owner-authored line on a partial fail would be overreach.

---

## The agreed copy

Written out so Phase 1 applies it rather than re-deciding it.

**Headline** — unchanged, D23:

> AI systems that show their work and refuse to fake it

**Lede** — replaces the current one:

> **Rohit Agrawal** — principal engineer, fourteen years deciding whether software was safe to
> release, now building AI systems that make that decision about themselves. Citation, disclosed
> uncertainty, honest refusal, and evaluation gates that can block their own release.

Note what changed: *"now building independent AI systems"* implied a break. *"now building AI
systems that make that decision about themselves"* makes the fourteen years the setup for the
punchline. Same facts, no new claim, and the sentence answers `PRODUCT.md:32` in its own clause.

**Hero sentence replacing shift-left/shift-right** (0.6):

> Quality and evaluation designed in from the first week, measured in production, and fed back
> into the next release.

**`Seeking` — one line** (0.5):

> Senior / Principal — AI Platform Engineering, with evaluation and release governance

One slot a recruiter recognises, with the specialism attached. Five titles read as *"does not
know what he wants"*; a title too narrow to search reads as *"not my req."*

**Contact plate opening** (0.4) — the owner's sentence, promoted:

> If your AI features work in the demo and not in the release, we should talk.

Followed by the existing plain statement of roles sought. This is the amended voice rule exactly:
the reader's problem, never his urgency.

---

## Open for the owner — one item

**The H-1B.** `FINAL-Rohit_Master_Resume` states an approved US H-1B visa. `Rohit_V3` does not
mention it at all, so this is a gap the master fills, which the precedence rule allows.

For a candidate stating "open to relocation worldwide", an already-approved H-1B is one of the
strongest signals available to a US recruiter — it removes the objection that usually ends the
conversation. **It is not on the site, and I have not put it there.** Visa status is personal
information and publishing it is his call to make, not mine. Flagged, not decided.

**Correction, 2026-08-09 — this file said "everything else in this file is applied" and two of
its four Changed rows were not.** `/impeccable critique` found both:

- **The headline.** The row reads *"Unchanged — it survived the test"*, which was written to mean
  *keep D23's decision*. D23 decided the headline **becomes** the full line; the live `<h1>` was
  still `AI that shows its work`, the truncation D23 rejected in as many words. So the site shipped
  the half this very document identified as the weak one — *"shows its work" partially fails the
  table-stake red flag*, while *"refuse to fake it" is the half nobody else claims*. Now shipped.
- **The contact plate.** The owner's demo-vs-release sentence was recorded here as settled for that
  plate and never put on the page, and the five-title problem "fixed" in the hero ledger had simply
  relocated to it. Both fixed.

That is the **second** claim-of-method-or-application in this file that did not survive a check,
after the `grilling` provenance line. The pattern is the same both times: a planning document
asserting its own execution, with nothing checking. The gate that would catch it does not exist —
noted as open work, not as a resolved item.
