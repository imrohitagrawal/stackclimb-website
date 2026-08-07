# Enforcement design — what can be a gate, and what cannot

Answers one question: which of this project's failures can be caught by a machine, and which
cannot. Written after five owner directives were dropped and seven gates were found unable to fail.

**Nothing here is built. This is a design awaiting approval.**

Verified mechanism: the `Stop` hook receives JSON on stdin with `hook_event_name`, and its exit
code controls the turn. `.claude/skills/impeccable/scripts/hook.mjs:31-51` already does this. So
turn-blocking is real, not theoretical.

---

## Tier 1 — CI tests. Bind everyone, cannot be skipped

Strongest tier. Each is a straightforward assertion over the built output.

| Gate | Catches | How it fails |
|---|---|---|
| **No bare contact strings** | The dropped directive. Assert no text node in `dist/**/*.html` matches an email or a bare `linkedin.com`/`github.com` path | Regex over built HTML |
| **Every outbound link resolves** | **DEF-7 — SaafSaans advertised as "Deployment", returns HTTP 000.** Fetch every `href^=http`, assert 200, denominator = link count | Would have caught the live embarrassment |
| **Build before test** | DEF-11. Change `webServer.command` to `astro build && astro preview`, drop `reuseExistingServer` | Config, one line |
| **Exact plate list, not `> 0`** | DEF-12 — deleting content turns the suite green | `toEqual([...7 ids])` |
| **Whole-page axe, not just plates** | DEF-14 — nav and footer never scanned | Drop the `.include()` scope for one pass |
| **Focus ring visible, not merely declared** | DEF-13 — a transparent outline passes today | Sample the computed outline colour against the surface behind it |
| **Contrast per plate, both viewports** | DEF-5 | Exists; needs the mobile count too |
| **File budget** | `AGENTS.md` says budgets must be executable. They are not | 250 lines / 32,000 bytes / 120 chars, scope stated |
| **Index integrity** | `docs/practices/README.md` lists 9 files; 6 do not exist | Every `[link](path)` in `docs/**` resolves |
| **No JS-dependent legibility** | RCA-002 — `plates.js` dead still renders 1.03:1 | Run the a11y pass with the module forced to throw |

**Delete `expect(widths.length).toBe(3)`.** It compares a literal to itself and goes red when
coverage improves — the exact anti-pattern `AGENTS.md` bans.

## Tier 2 — Branch protection. Binds merges

One setting kills the largest process failure in the project: **24 commits straight to `main`,
zero branches, zero PRs, zero CI runs.**

```
require a pull request before merging
require status checks to pass    → the Tier 1 job
require branches to be up to date
```

Nothing else in this document matters as much. Every rule written so far was bypassable because
this was off.

## Tier 3 — Tracked hooks. Bind behaviour at the moment of the mistake

**These only bind if `.claude/settings.json` is tracked in git.** It does not currently exist —
and `.gitignore:20-24` claims it does and "carries the shared gates". That comment is false and
is itself a defect.

| Hook | Event | Catches | Confidence |
|---|---|---|---|
| **Block commits to `main`** | `PreToolUse` on Bash | Direct-to-main | **High** — exact string match on the command |
| **Block `--no-verify`** | `PreToolUse` on Bash | Gate bypass | **High** — quorum-ai already does this |
| **Name your skill** | `PreToolUse` on Agent | L-REV-3 — 13 agents spawned with no skill | **Medium** — needs the prompt to name a skill or say why not |
| **Unrecorded agreement** | `Stop` | The five dropped directives | **Low-medium** — see below |
| **No completion claim without a run** | `Stop` | "It works" with no test output | **Medium** |

### The unrecorded-agreement hook, honestly

The idea: on `Stop`, if this turn's output contains an agreement — *"you're right"*, *"I'll fix"*,
*"good catch"*, *"that was sloppy"* — and neither `docs/OWNER-DIRECTIVES.md` nor `docs/STATUS.md`
was modified, block the turn.

**Why it might work:** the *file-modified* half is exact. `git status --porcelain` either shows
the register or it does not. No judgement.

**Why it will be noisy:** the *agreement* half is phrase matching. "You're right" appears when
agreeing about a fact, not only when accepting a directive. False positives are certain.

**So it ships ADVISORY, not blocking.** From the research: blocking checks need essentially zero
false positives; above ~10% not-useful, a check goes on probation, above 25% it gets disabled.
Ship it warning-only, count the false positives for two weeks, promote it only if the rate is low
enough — and write that exit condition down in the same commit, per `AGENTS.md`.

**A gate shipped advisory with no stated promotion condition becomes decoration.**

## Tier 4 — Cannot be gated. Say so rather than pretend

Naming these matters as much as building the rest, because a false sense of coverage is worse
than a known gap.

| Failure | Why no machine catches it |
|---|---|
| **Did I understand what he meant?** | The contact-links directive was *recorded* as understood and still not done. Comprehension is not observable |
| **Is this the right design?** | No oracle exists. This is what review is for |
| **Is the RCA honest?** | A machine can check an RCA exists, not that its cause is the real one |
| **Is the claim on the site true?** | A gate can check a claim has an evidence link. Whether the evidence supports it is human |
| **Did the reviewer actually execute?** | Requiring pasted output raises the cost of lying; it does not make it impossible |
| **Was the fan of agents worth its cost?** | Needs seeded-defect recall, which does not exist yet |

For Tier 4 the only defence is the human backstop — and it belongs **above** the enforcement
line, honestly labelled, not disguised as a gate.

---

## Order to build, if approved

1. **Branch protection** (Tier 2). One setting. Prevents recurrence of the worst failure while
   everything else is being built.
2. **Fix the gates that cannot fail** (DEF-11 to DEF-15). A CI job whose tests are theatre is
   worse than no CI, because it certifies.
3. **Tier 1 CI job**, with the new gates.
4. **Tier 3 hooks**, starting with the two high-confidence ones. `.claude/settings.json` must be
   created and tracked first, and the false `.gitignore` comment corrected.
5. **The advisory hook**, with its promotion condition written in the same commit.

## The honest limit

Every gate here catches a *repeat*. Quorum-AI's own measurement: **0 of 16 real defects were
caught by an automated check; 10 of 16 by adversarial review.**

So this document buys reliability, not discovery. It stops known failures recurring. It will not
find the next unknown one — that is what the review fan is for, and why both are needed.
