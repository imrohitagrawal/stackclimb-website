# Good practices — harvested for reuse

Findings from this project that should carry to the next one. Kept separate from `AGENTS.md`
on purpose: that file is this repo's rules, this folder is what any project should inherit.

One concern per file. No file over 250 lines. A parent indexes and links; it never restates.

| File | Covers |
|---|---|
| `enforcement.md` | Why rules fail, and the only layers that bind |
| `verification.md` | Execution as the source of truth; how claims decay |
| `gates.md` | What makes a gate real: denominators, proven-red, blocking vs advisory |
| `review.md` | Fan sizing, independence, the circuit breaker |
| `skills.md` | Choosing, composing, and keeping skills current |
| `memory.md` | Structured records, consolidation, keeping files small as a project grows |
| `measuring-practice.md` | How to know whether any of the above is actually working |
| `session-close.md` | The five steps that end a session |
| `definitions.md` | Ready, Developed, Tested, Done, Complete |

## How a finding gets in here

Three conditions, all required:

1. **It cost something to learn.** A mistake, a wasted cycle, or a defect that escaped.
2. **It generalises.** It would apply to a project with a different stack.
3. **It is stated as a rule with its evidence.** Not "be careful" — a rule, and the case that
   produced it.

A finding that fails any of the three stays in `docs/STATUS.md` as project history and does not
get promoted here.

## Rule for the files themselves

Every entry carries the concrete case that produced it. A rule without its case gets ignored the
first time it is inconvenient, because nobody remembers what it cost.
