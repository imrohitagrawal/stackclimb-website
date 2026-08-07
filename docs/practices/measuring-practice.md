# How to know whether a practice is working

**A practice with no measurement is a preference.** It survives on the fact that nothing has
obviously gone wrong yet, which is also what a broken practice looks like.

This file answers four questions: how you prove the approach caused the outcome, how you learn
from it, how you improve, and how you know next time whether you repeated the mistake.

---

## 1. Proving the approach caused the outcome

You cannot prove it from the work itself. The work has no control group — you did it once, one
way, and it came out how it came out. Three things do produce evidence.

### Seeded defects — the only real number

Plant known defects. Run the practice. Count how many it finds.

```
1. Take a clean commit.
2. Introduce N defects of known type and severity, on a copy, recorded in a sealed list.
3. Run the practice as it is actually defined — same reviewers, same gates.
4. Recall  = found / N.        Precision = true findings / all findings.
```

Without this, "the fan works" is a feeling. With it, it is a percentage that can go up or down.

The defects must be *representative*, not convenient. Seeding six obvious typos measures nothing.
Seed the classes that have actually escaped: a contrast value below AA, a test that passes when
its subject is deleted, a claim in prose with no evidence, an off-by-one in a denominator.

### Prediction before the run

Before starting a review, write down what you expect it to find. Afterwards, compare.

- Found what you predicted → the practice confirmed what you already knew. Cheap, low value.
- Found what you did **not** predict → that is the value, and it is measurable.
- Predicted and did **not** find → the practice has a blind spot with a name.

The third case is the useful one and it is invisible without the prediction written first.

### Cost per decision changed

Count the findings that actually changed a decision. Divide by what the practice cost.

Measured this session: roughly **900,000 subagent tokens** across 13 agents, producing perhaps
**15 findings that changed a decision.** Nobody has checked whether that is a good trade,
and until someone does, "fan out widely" is an aesthetic preference wearing a method's clothes.

## 2. Learning from it — the recurrence rule

**Every learning gets an ID. If the same ID is filed twice, the rule did not bind.**

That is the whole detector. It needs no tooling and it cannot be argued with.

| Times an ID recurs | What it means | What to do |
|---|---|---|
| 1 | A mistake happened | Write the rule |
| 2 | The rule is prose and prose does not bind | Escalate to a mechanism — a gate, a hook, a check |
| 3 | The mechanism is wrong, or it is not reachable at the moment of the mistake | Change the mechanism, not the person |

A learning refiled under the same ID is the single cheapest signal available, and it is free.

**Already measurable here.** Four directives were repeated 2–4 times before being honoured
(`docs/OWNER-DIRECTIVES.md`). Every one was fixed only when it became a *file*. That is a
recurrence count of 2–4 with a consistent resolution — the strongest evidence in the project
that prose does not bind and mechanism does.

## 3. Improving — escalate the enforcement tier, never the reminder

When a rule fails, the wrong response is to state it more emphatically. Move it down a tier:

```
chat instruction        ← evaporates
skill                   ← opt-in
memory                  ← a hint
AGENTS.md               ← always loaded, still only influence
──────────────────────── the line
tracked hook            ← runs on every change
CI test                 ← runs for everyone
evidence-artifact gate  ← fails when the diff lacks the artifact its change required
```

**A rule that failed twice above the line does not get rewritten. It gets moved below it.**

Worked example. "Verify by executing, not reading" failed at least twice this session — the
`project-doc-skills` dismissal and the `arize` substring. Rewriting it in `AGENTS.md` would be
the third statement of the same sentence. The tier below is mechanical: **a finding is not
accepted until the report contains a command and that command's actual output.** That is
checkable by a reviewer, and eventually by a script.

## 4. Knowing next time

Three checks, in order of cost:

1. **Before starting:** read `docs/learnings/` for the phase you are entering. If an entry
   describes the work you are about to do, its rule applies now, not in review.
2. **During:** when a finding arrives, ask "what command proves this?" If there is none, it is
   `REPORTED`, not `VERIFIED`. Label it and move on — do not act on it.
3. **After:** if you file a learning, check whether its ID already exists. A duplicate is not a
   new lesson; it is the old rule failing, and it triggers the escalation in section 3.

## The uncomfortable part

Everything in this file is itself unmeasured. It is a design for measurement, not a measurement.
The first honest thing to do is run one seeded-defect trial and get a real recall number, even a
bad one — because a bad number that exists beats a good practice that nobody has tested.

**Until that trial runs, treat every claim about this project's review quality as `REPORTED`.**
