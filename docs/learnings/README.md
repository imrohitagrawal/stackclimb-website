# Learnings — indexed by phase, not piled in one file

Where a mistake was *caught* is less useful than where it was *introduced*. A contrast bug found
in testing was introduced in design. File it under the phase that could have prevented it.

## Index

| Phase | File | Entries |
|---|---|---|
| Planning & requirements | [`planning.md`](planning.md) | 3 |
| Design & architecture | [`design.md`](design.md) | 1 |
| Development | [`development.md`](development.md) | 1 |
| Testing | [`testing.md`](testing.md) | 3 |
| Security & publishing | [`security.md`](security.md) | 2 |
| Review & orchestration | [`review.md`](review.md) | 2 |

## Entry format

Every entry carries all five fields. An entry missing the cost or the rule is a note, not a
learning, and belongs in `docs/STATUS.md` instead.

```
### L-<phase>-<n> — <one-line title>

**Where introduced:** the phase that could have prevented it
**Where caught:** the phase that actually found it, and by what
**Cost:** what it actually cost — time, a wrong decision, a defect that shipped
**What happened:** the concrete case, with the command or file that proves it
**Rule:** the sentence that prevents a repeat
```

## Why the gap between introduced and caught matters

That gap is the real number. A defect introduced in planning and caught in testing crossed three
phases before anyone noticed — that is a gate missing at each one. Track the gap, not the count.

Planning defects are the expensive ones. A wrong requirement costs a rewrite; a wrong line costs
a line.
