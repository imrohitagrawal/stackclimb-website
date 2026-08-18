---
name: review-synthesizer
description: Use after two or more reviewers report, before acting. Cross-checks the reports and flags disagreement.
---

# Review Synthesizer

## Overview

Closes the gap named in `docs/OWNER-DIRECTIVES.md` row W-19 and described as an idea, never
built, in `docs/learnings/case-study-001-multi-agent-review.md:88`: *"A synthesizer reviews the
four role reviewers before I act."* Before this skill, N reviewer reports went straight from
agent to operator, and the operator was the only filter — a filter that reads rather than runs.

This skill does not re-review the work. It reviews the *reviewers*: where they agree, where
they contradict each other, and where a claim cannot be reconciled without going back to the
source. It runs in the same session as the operator (context isolation, not model-weight
decorrelation — say so in the output, per `AGENTS.md`'s review section).

**Announce at start:** "I'm using the review-synthesizer skill to cross-check these N reports
before acting on any of them."

## When to use this

Any time two or more independent reviews exist for the same change or plan: role-fan reviews
(`docs/practices/plan-review-roles.md`), adversarial test reviewers (`AGENTS.md`'s "two
adversarial reviewers on any test change"), or a mixed fan of skills and agents. Not needed for
a single reviewer — there is nothing to cross-check yet.

## Inputs

- Two or more reviewer reports, as file paths or pasted text. Each report must be attributable
  to a named reviewer (role, skill, or agent id) — an unattributed report cannot be cited in
  the disagreement table below.
- The artifact under review (plan, diff, or PR), for citing back to when a finding needs a
  location the reviewers disagree about.

## What "cross-check" means here

This is not majority vote. A finding two reviewers hold and one refutes with a command is worth
more than three reviewers restating the same untested assumption — see `AGENTS.md`'s own
measured case: a five-lens fan raised 32 findings, independent verifiers refuted 23. So:

1. **Group findings by subject**, not by reviewer. Two reviewers describing the same defect in
   different words are one point, not two.
2. **For each point, record every reviewer's position** — hold, refute, or silent (a reviewer
   who did not mention a subject is not evidence against it).
3. **Prefer findings backed by a command or a run over findings backed by reading alone**, per
   `AGENTS.md`'s "reviewers execute, they do not read and assume." Note which side of a
   disagreement ran something and which side asserted.
4. **Never resolve a disagreement by picking the more confident-sounding report.** Confidence is
   not evidence. An unresolved disagreement is a valid output.

## Output format

Produce exactly these four sections. Every claim in them must trace to a specific reviewer.

### 1. Points of agreement

One line per point, naming every reviewer who held it. Only include a point here if **no**
reviewer refuted it (silence does not count as agreement, only as non-disagreement).

### 2. Points of disagreement

One entry per point, in this shape:

```
- [Subject, one line]
  - Reviewer A: [position, cite file/line or command if given]
  - Reviewer B: [position, cite file/line or command if given]
  - Which side ran something vs. only read: [state plainly, or "neither ran anything"]
```

Do not add a fifth line resolving it here — resolution is the recommended-verdict section, and
only if the fixpoint criterion below is met.

### 3. Recommended verdict

State a verdict **only** for points where every reviewer that addressed the subject agrees, or
where a command was independently run and settles a disagreement (cite the command and its
output — not "Reviewer A is probably right"). For every point of disagreement that cannot clear
this bar, write it here as **UNRESOLVED — needs: [the exact check that would settle it]**,
naming the command or the person who can run it. Never let an unresolved point disappear between
section 2 and section 3.

### 4. Coverage and honesty note

- How many reports were read, and were any partial, truncated, or missing attribution.
- Whether this synthesis itself ran anything or only read the reports (usually the latter — say
  so; a synthesizer that only reads inherits the same limitation `AGENTS.md` warns about for any
  reviewer that "reads and assumes").
- Explicit note that this is context isolation from the reviewers, not independent model
  weights, unless the reviewers genuinely were a different model family end to end.

## What this skill must never do

- Never average or split the difference between two positions ("probably somewhere in
  between") — that invents a third, unverified position.
- Never drop a disagreement silently because reconciling it is inconvenient. An unreconciled
  disagreement reported honestly is more useful than a false consensus.
- Never treat its own output as a fifth review. It has not looked at the artifact itself with
  fresh eyes — only at what other reviewers said about it. If the reports disagree on something
  load-bearing, the answer is "go run the check," not "here is my opinion."

## Circuit breaker

If synthesis surfaces a **new class** of disagreement not visible in any single report (for
example: two reviewers who each individually looked correct turn out to contradict each other
on a fact, not an opinion), that is exactly the signal `AGENTS.md`'s circuit breaker names —
stop and escalate rather than picking a side to keep moving.

## Worked example, in miniature

Two role reviewers report on the same plan. Dev says "the retry loop has no backoff, will
hammer the API." Ops says "the retry loop has exponential backoff at line 42." Both cite the
same file. This is not consensus and not a coin flip — it is a two-line command
(`grep -n backoff plan-target.js`) that settles it. The synthesizer's job is to name that
command in section 3, not to guess which reviewer read the file more carefully.
