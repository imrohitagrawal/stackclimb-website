# Case study 001 — Did the multi-agent review approach work?

**Period:** 2026-08-07, one session · **Sample:** 13 agents (9 research, 4 role reviewers)
**Evidence strength:** WEAK. No control group, one session, one project, one operator. This
records what happened. It does not prove the method caused it.

---

## The question

We ran a fan of subagents instead of investigating alone. Was that better, and where did it fail?

## Behaviour before

Single-threaded. I read a repo, formed a view, reported it. Verification meant re-reading. The
failure mode is invisible: a wrong conclusion looks exactly like a right one, and nothing
disagrees with you.

## Behaviour after

13 agents across research and role review. Each got an explicit remit, was told to cite file and
line, and was told that "could not verify" is a valid answer. Several were told to contradict me.

## The tally — what the agents actually produced

| # | Agent | Outcome |
|---|---|---|
| 1 | Quorum engineering policy | **Held.** Durability hierarchy, hook caveat. I re-verified the hook caveat myself (`.gitignore:27`) |
| 2 | NarraTwin gates + RCA | **Partly wrong.** Said no file-size rule existed, "verified five ways". `ADR/0047:55` on `main` has it |
| 3 | Gate governance + CiteVyn | **Held.** Gate-layer model, real CI steps read from YAML |
| 4 | Skill provenance | **Held, and corrected me.** `.claude/skills` were 10 symlinks, not 10 skills — 112 not 122 |
| 5 | Web research | **Held, and corrected me.** `PostToolUse` exit 2 does *not* block; I had said it did |
| 6 | Testing / security / perf skills | **Held.** Found the `security-review` name collision and a Snyk failure |
| 7 | Big collections | **Held.** VoltAgent and agentskills are not skill sets at all |
| 8 | UI/UX + PM + doc skills | **Both.** Wrongly dismissed `project-doc-skills` — read a build input. Correctly refuted my own `ui-ux-pro-max` justification |
| 9 | Memory / dreaming | **Held, and self-corrected.** First concluded auto-dream did not exist, then grepped the binary and found it |

**Held: 7. Materially wrong: 1. Mixed: 1.**

## What worked, and why

**1. Agents caught my errors more often than I caught theirs.**
Four of my claims were refuted by agents: the `ui-ux-pro-max` "independent heuristics"
justification, `PostToolUse` blocking, the 122 skill count, and the font-weight analysis. I
caught one agent error before the owner did.

*Why:* a fresh context does not inherit the reasoning that produced the mistake. It cannot
sympathise with a conclusion it never reached.

**2. Telling an agent to contradict me produced the highest-value findings.**
Every one of the four refutations above came from an agent explicitly told to check a specific
claim of mine.

**3. "Could not verify is a valid answer" prevented invention.**
Agents returned real gaps: Hetzner's prices are client-side rendered, GitClear's PDF is
image-only, Deque's WCAG-coverage figure could not be reached. None fabricated a number.

**4. Agent 9 self-corrected mid-task.** It concluded "dreaming" was not a Claude Code feature
from documentation, then grepped the binary and refuted itself. Documentation lost to execution
inside a single agent run.

## What did not work, and why

**1. I verified agent output by reading it. That is the whole failure.**
Agent 8's `project-doc-skills` dismissal survived because I read a plausible report and relayed
it. One command — extracting `dist/doc-critic.skill` and listing its contents — would have
refuted it in seconds. I ran that command only after the owner pushed back.

*Cost:* dismissed the single best-fitting skill in the entire evaluation. It is now a top-two
install.

**2. No agent reviewed another agent.** Nine research agents, zero cross-review, zero
synthesis. Each report went straight from agent to owner through me, and I was the only filter —
a filter that reads rather than runs.

**3. A wrong finding is more expensive than a missing one.** Agent 2's "no file-size rule"
did not merely leave a gap; it caused me to *invent* a limit and present it as reasoned. The
owner's memory was the only thing that caught it.

**4. Volume created its own problem.** Nine reports of 60–160k tokens each. I relayed summaries
of summaries. The `arize`-style substring error is exactly what survives that compression.

## What changed as a result

| Before | After |
|---|---|
| Agent verdicts relayed as findings | Relayed as `REPORTED` until independently run |
| No reviewer for agent output | A synthesizer reviews the four role reviewers before I act |
| "Verify" meant re-read | Role reviewers are ordered to execute; the QA reviewer must mutate a copy and watch tests go red |
| Reviewers could edit | All reviewers read-only, told in capitals not to write |

## The measurement that would settle it

None of the above is proof. What would be:

- **Seeded-defect recall.** Plant 10 known defects, run the fan, count how many it finds. Without
  that, "the fan works" is a feeling.
- **False-positive rate per agent.** Currently unmeasured. Quorum-AI's own number — 32 findings,
  23 refuted — suggests it is high.
- **Cost per verified finding.** Roughly 900k subagent tokens produced perhaps 15 findings that
  changed a decision. That is not obviously a good trade, and nobody has checked.

## The rule this produces

**A subagent's report is a hypothesis with a citation. It becomes a finding when someone runs
the command in it.**

Corollary: if a report cannot be verified by running something, say so in the report. An
unverifiable finding is not a cheaper finding — it is a different thing, and it should be
labelled.

## Honest counter-argument

The single worst error of the session was mine, not an agent's: I wrote that
`ui-ux-pro-max` had independently authored heuristics, having read neither its rules nor
impeccable's. An agent caught it.

So "agents are unreliable, verify them" is only half the lesson. The other half is that the
operator is *also* unreliable, and the fan is what caught him.
