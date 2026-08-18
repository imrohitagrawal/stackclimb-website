# Plan review roles — a menu, not a mandate

`docs/OWNER-DIRECTIVES.md` row W-23 names eight roles a plan review can draw on: architect, dev,
tester, PM, program, eng, ops, DevOps. No fixed 8-role roster existed anywhere before this file —
every past plan review improvised a different mix (4, 6, or 7 reviewers, different names each
time). This file defines all eight so a future review picks from a known set instead of
reinventing names.

**This is a menu to pull from, not a mandate to always use all eight.** `AGENTS.md`'s "size the
fan to the phase" rule governs which subset runs on any given plan: planning and architecture get
the full expert fan because sequential investigation anchors on the first theory and breadth pays
here; implementation scales to blast radius. Running all eight on a one-file docs change wastes
budget the same way running one reviewer on a security-relevant plan under-covers it. Pick the
roles whose lens the plan actually needs, and say in the plan which ones were skipped and why.

Two or more of these roles reporting on the same plan should have their findings run through
`.agents/skills/review-synthesizer/` before anyone acts on them — see `docs/OWNER-DIRECTIVES.md`
row W-19.

## The eight roles

Each is phrased as the prompt to hand that reviewer — the lens, not a job title.

**Architect** — Does the plan's shape hold up structurally? Are the module boundaries clean, or
does one file need "and" to describe it? Does a component introduced here create a dependency
that will be expensive to reverse later? Flag anything that locks in an architecture decision the
plan does not name as a decision.

**Dev** — Can this actually be implemented from what's written, task by task, without guessing?
Are file paths, function signatures, and interfaces between tasks exact enough that a task can be
handed to a fresh engineer with zero other context? Flag any "TBD", any step that describes what
to do without showing how, and any place two tasks assume different names for the same thing.

**Tester** — Does this plan say how each new behavior gets verified, including the failure case?
For every claim the plan makes about what will be true afterward, is there a named test or gate
that would go red if it weren't? A plan with no failure-case coverage is not tested, it's hoped.

**PM (Product Manager)** — Does this plan solve the stated problem, for the actual audience, and
nothing more? Is scope creeping past what was asked? Is there a simpler version that ships the
same user-visible outcome? Flag anything built because it seemed useful rather than because it
was requested.

**Program** — Are the dependencies between tasks and any external parties (owner approval,
third-party services, other repos) named and sequenced correctly? Is there a step that silently
assumes something upstream is already done? Does the plan's own ordering match what it depends
on — could a later task actually run before an earlier one is finished?

**Eng (Engineering lead)** — Looking across the whole codebase, not just this change: does this
plan follow or fight the patterns already established here? Does it introduce a new way of doing
something the repo already does another way, without a stated reason? Is the blast radius (how
many files, how central they are) correctly matched to how much review the plan calls for?

**Ops** — Once this ships, who deals with it running in production? Does the plan change
anything about deploys, monitoring, or what happens when it breaks at 3am? Is there a rollback
path, and is it as easy to execute as the roll-forward path? Flag anything that adds an operational
dependency (a new service, a new secret, a new manual step) without naming who owns it.

**DevOps** — Does the plan's build, test, and deploy path actually work end to end, mechanically?
Will CI catch a regression this plan introduces, or does the plan add something CI cannot see (a
manual step, an untested config value)? Does anything in the plan change what gates run, and if
so, is the gate itself tested — proven to go red on the defect it claims to catch?

## Why dev, eng, ops, and DevOps are not the same lens

The four names sound close but ask different questions: dev checks whether *this task* is
buildable from what's written; eng checks whether the *whole codebase* stays coherent after it;
ops checks what happens *after it ships and something goes wrong*; DevOps checks whether the
*pipeline* that gets it there and keeps it running can actually do so mechanically. A plan can
pass one and fail another — a change can be perfectly implementable (dev: pass) while quietly
duplicating a pattern the rest of the repo already solved differently (eng: fail).

## How to use this

1. Read the plan once.
2. Pick the subset of roles whose question the plan genuinely raises — not all eight by default.
3. Hand each picked role its paragraph above as the reviewer's prompt, plus the plan itself.
4. If two or more roles ran, synthesize before acting — see the review-synthesizer skill above.
5. Record in the plan (or `docs/STATUS.md`, if the plan becomes a decision row) which roles ran
   and which were deliberately skipped, so the choice is visible rather than silent.
