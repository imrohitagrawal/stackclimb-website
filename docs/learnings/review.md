# Review & orchestration

### L-REV-1 — A verdict inherited from one agent is a claim, not a finding

**Where introduced:** review · **Where caught:** the owner pushed back
**Cost:** dismissed a genuinely useful skill suite, and would have skipped the single best-fitting
skill found in the whole evaluation.

**What happened:** an agent reported that `project-doc-skills` had dangling references. It had
read `skills/<name>/` — a build *input*. `house-style.md`, `project-profile.md` and `verify.py`
are copied in by `build-skills.sh`; the product is `dist/*.skill`, a 66 KB zip containing all 16
files. I relayed the verdict without checking the artifact.

**Rule:** test the artifact that ships, not the source that builds it. And a subagent's verdict
carries the status of what it actually ran — relay it as `REPORTED` until independently checked.

### L-REV-2 — A second lens reciting the same standard is not a second opinion

**Where introduced:** review · **Where caught:** an adversarial review of my own routing table
**Cost:** would have installed a reviewer that agrees with the thing it reviews by construction.

**What happened:** I routed `ui-ux-pro-max` as the independent lens over `impeccable`'s output,
justified as "its own heuristics, authored independently". 115 of its 208 rules cite Apple HIG,
Material Design, WCAG, or Core Web Vitals — the same standards `impeccable/reference/audit.md`
checks against. Independently *compiled* is not independently *derived*.

**Rule:** independence comes from a different **method** or a different **remedy space**, not a
different vendor. Ask what the second lens can see that the first structurally cannot.

### L-REV-3 — Installing a skill is not using it. **This is a recurrence.**

**Where introduced:** orchestration · **Where caught:** the owner, twice
**Cost:** hand-wrote 13 agent prompts and 4 role-reviewer definitions that already existed,
and skipped a skill whose first line is "You MUST use this before any creative work."

**What happened, twice:**

1. Installed `brainstorming`, `grilling`, `grill-with-docs` — three skills for jamming on
   requirements — then built without invoking any of them, after the owner asked to jam more
   than once. Worse: `brainstorming` was not even installed until he pointed it out.
2. Spawned 13 subagents with the raw Agent tool and hand-written prompts, while
   `dispatching-parallel-agents` sat installed and unread. It ships an Agent Prompt Structure
   and a Common Mistakes list. `requesting-code-review` — which dispatches a reviewer over a
   git SHA range with a read-only guard — also sat unused, while I hand-wrote that guard in
   capitals each time.

Also re-invented: four role-reviewer definitions. `addyosmani/agent-skills` already ships
`code-reviewer.md`, `security-auditor.md`, `test-engineer.md`, and `web-performance-auditor.md`.

**The uncomfortable part:** the hand-written prompts happened to satisfy most of the skill's
own rules — focused scope, pasted context, explicit read-only constraint, named output. That is
luck, not method, and it is why the miss went unnoticed. A rule you accidentally follow gives no
signal when you stop following it.

**Rule:** before spawning an agent or starting creative work, list which installed skills apply
and say why each was used or skipped. "I did not think of it" is the failure this prevents.

**This entry is a RECURRENCE of the same root cause as the four repeated directives in
`docs/OWNER-DIRECTIVES.md`.** Per `docs/practices/measuring-practice.md`, a rule that fails
twice does not get restated — it gets moved below the enforcement line. Restating "use your
skills" a third time would be worthless.

**Proposed mechanism, not yet built:** a `PreToolUse` hook on the Agent tool that refuses to
spawn until the prompt names the skill it is following, or names the skill it deliberately is
not. Cheap, mechanical, fires at exactly the moment of the mistake. Needs an RCA and approval
before it is built.
