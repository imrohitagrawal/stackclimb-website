# RCA-009 — the local baseline set goes stale, and one cause tells two opposite lies

**Status: written before the fix, per the AGENTS.md order, on 2026-08-27.**

DEF-65 has been open since 08-25 and D124 was recorded as making it *quieter, not gone*. This
document measures what "quieter" actually means, and it is worse than the row says: the same
cause now produces **two opposite failures**, and the row only describes one.

## What happened

This repo commits visual baselines for one platform. `.gitignore` tracks
`tests/visual-baselines.spec.js-snapshots/*-linux.png` and `tests/geometry-baseline.linux.json`
and ignores every other platform's — decision D117, deliberate and not reopened here.
Regeneration happens only on a CI runner through `gates.yml`'s `workflow_dispatch`, and a guard
(DEF-59) refuses local writes to tracked baselines.

So a regeneration refreshes the **linux** set. The developer's local **darwin** set is never
touched, and nothing anywhere records that it is now behind.

## The measurement

State of this Mac at `10c813b`, 2026-08-27:

| | Written | |
|---|---|---|
| local darwin PNGs | 2026-08-25 19:37 | untracked, 60 files |
| local darwin geometry JSON | 2026-08-25 21:55 | untracked |
| commits to `src/` since | **3** | including D130 and D135, which both changed the home panel images |

Both suites were then run against that provably stale set:

| Gate | Result | What it means |
|---|---|---|
| `tests/visual-baselines.spec.js` | **14 passed, 0 failed** | **It lies green.** A stale baseline certifies a page it has never seen |
| `tests/geometry.spec.js` | **44 passed, 6 failed** | **It lies red.** Six failures that are not defects and that CI cannot see |

**One cause, two opposite lies.** The DEF-65 row describes the red one and records D124 as
having removed it; D124 removed it from the *pixel* gate and left it on the *geometry* gate,
where it is still six red tests every Mac session. And the green lie is new — it is what D124
traded the red one for.

The row's own words, and they are the right ones: D124 "removes the symptom that made it
visible, which is the weaker half."

## Where it was introduced

At the **design stage of D117**, the decision to track one platform. That decision is correct —
a linux baseline and a darwin one differ on 148 of 828 keys at the same commit, so committing
both would be committing a permanent conflict. What D117 did not carry was the other half:
if only one platform's set is refreshed by a regeneration, the others need a way to know they
are behind. The gap has been open since.

## Where it was caught

By a person, three times, and never by a mechanism: while verifying D121, again in D124's
measurement, and again today. In between, the cost is paid as **prose** — every session handoff
carries a paragraph warning the next session that local red is not a defect. A warning that has
to be repeated in every handoff is a mechanism that does not exist.

## Cost

Two costs, and the cheap-looking one is the dangerous one.

- **The red lie** costs time and trust: a session opens on six red tests, has to be told they
  are noise, and learns that red does not mean red. That is the expensive lesson to teach a
  test suite's reader.
- **The green lie** costs correctness: a developer changes a plate, runs the pixel gate locally,
  sees green, and concludes the change moved nothing — when the baseline it compared against
  predates two commits that moved the images. This is the exact shape of defect the gate exists
  to catch, being certified as absent by the gate itself.

And the obvious reaction to the red — regenerate — is either refused by the DEF-59 guard (for a
tracked file) or silently allowed (for the untracked darwin one), where it re-stales the set
against a newer commit without saying so.

*(One number here is inherited, not measured by this package: "a linux baseline and a darwin
one at the same commit differ on 148 of 828 keys past the slack, worst 42px" is D115's
measurement, recorded in the Rejected table. A local comparison today cannot re-derive it —
this Mac's darwin file is stale, so any diff against the current linux file mixes platform
difference with staleness. That confound is itself the defect.)*

## How the option was chosen

DEF-65's row records three options and picks none. Rather than pick by taste, three designs
were built — one per option, each told to make the strongest case for its own option and then
attack it — and scored by three independent reviewers: one for correctness, one for what it
costs the person at the keyboard, one whose only job was to defeat all three.

**All three reviewers ranked option C first, and for the same reason** — a reframing that
corrects the row's own wording:

> A baseline is *supposed* to be older than your build; that is what makes it a reference.
> The defect is not "older than my build". It is **"seeded from a different generation than the
> committed set CI reads."**

That distinction decides the trigger. Watching the *source* move is the wrong signal:

| Trigger | Fires on | Measured nag rate |
|---|---|---|
| A — fingerprint of `dist/` | every run where anything was edited, **including your own work in progress** | every informative run |
| B — a git hook on every HEAD move | 68 of 194 commits | 35% |
| **C — the committed baseline blobs moving** | 25 of 194 commits | **13%** |

Option A was defeated outright: its stale state *skips* the comparisons, and any edit makes it
stale, so there is no state in which its local comparison can report a real breach. It also
false-fires on two real commits in this repo — `928bb93` changes only an HTML comment, and
`de82c9f` changes only `src/styles/print.css`, which moves no screen pixel but does rename the
content-hashed CSS bundle. Option B has six single-command defeats, measured in a throwaway
repo: `git reset --hard`, `git stash`/`pop`, `git revert`, `git cherry-pick`,
`git checkout -- src/` and `git restore src/` all move the tree without firing its hook.

C's trigger was then checked against the real defect window, and it is exact. Since
2026-08-25 19:00, three commits touched `src/`: `67bd8fc` moved 13 tracked baselines,
`5cc9766` moved 29, and `de82c9f` moved none — and `de82c9f` is print-only CSS that cannot move
a screen pixel. **Zero false negatives and zero false positives on the window that produced
this defect.**

## The decision — C's trigger, with a refusal instead of a delete

**Recorded as mine, per the standing brief's wording: "a decision about how a local set is
invalidated, then the smallest mechanism that makes staleness LOUD."**

The panel recommended C as written, which **deletes** the stale local files. I am taking C's
trigger and its evidence, and **not** taking the delete. The mechanism refuses to trust the
local set and says so; it does not remove it.

Three reasons, in order of weight:

1. **It is the smaller mechanism, which is what was asked for.** The delete is what makes C
   expensive: it needs alias-safe unlink logic whose entire job is making sure the delete does
   not eat a committed file — a tracked-path filter, a `dev`+`ino` check against the tracked
   family, and an `export` added to the DEF-59 guard to reach it. Refusing never deletes, so
   that whole surface and its code do not exist.
2. **It removes two of the panel's own listed failure modes rather than accepting them.** Its
   list includes a delete triggered by *absence of evidence* (`.git/baseline-stamp.json` does
   not survive a re-clone, and absence reads as unknown provenance), and a concurrent run whose
   `globalSetup` can unlink sixty PNGs while another run is comparing against them — "raises
   the penalty from noisy to destructive", in its own words. Neither exists if nothing is
   unlinked.
3. **It matches the posture the repo already has.** DEF-59's guard *refuses a write*; it does
   not tidy up. The sentence that frames this correctly came from the losing design:
   **DEF-59 refuses to WRITE a tracked baseline locally; this refuses to TRUST an untracked
   baseline whose stamp does not match.** One rule, two halves.

What the refusal costs: the PNG half no longer self-heals. Under a delete, Playwright rewrites
the missing snapshots on the same run — fourteen reds, then green. Under a refusal the developer
types one printed command. That is a deliberate act rather than a tool deleting sixty untracked
files on their behalf, and on a repo whose subject is systems that disclose their limits, it is
the right trade.

## What is kept from the panel, and what is rejected with its reason

**Kept:**

- **C's trigger**, hashed from `git ls-files -s`, **not** `git ls-tree`. Verified here:
  `git ls-tree -r HEAD -- 'tests/*.spec.js-snapshots/*.png'` returns **0 entries and exit 0**,
  so a stamp built on it would hash the empty string forever and never fire. `git ls-files -s`
  over the same pathspec returns **61**. A self-test case refuses an empty authority list.
- **The environment strings** — `playwright-core`'s version and the resolved chromium build.
  Verified here: `1.62.1` and `chromium-1234`, with `chromium-1223` and `chromium-1228` sitting
  beside it. A browser bump re-rasterizes the self-hosted fonts and invalidates every local PNG
  while no tracked file changes at all; C alone is blind to that, and two strings close it.
- **The skip, and it is not optional.** Verified by running it:
  `compareLeg('home/w0390//', undefined, {a,b,c})` returns **4 breaches** — one for the leg and
  one per key. Across 44 legs that is roughly a thousand lines. A mechanism that leaves the
  comparisons running against a set it has just declared untrustworthy replaces six confusing
  failures with a thousand.
- **A refusal must fail a test, not only print.** A banner is prose, and prose enforces nothing
  in this repo.
- **Refuse rather than guess when git cannot answer.** Not knowing is not permission.

**Rejected, with the evidence:**

- **A's `dist/` fingerprint.** It cannot distinguish your own edit from someone else's landed
  commit, and your own edit is the normal case.
- **Hashing the bytes of the capture-defining files** (`viewport-clip.mjs`,
  `geometry-measure.mjs`, the specs). Argued for on the grounds that D124 changed the capture
  and invalidated all 60 PNGs without touching `src`. Rejected on this repo's own history:
  every capture change that actually moved the measurement **landed with its regeneration in
  the same commit** (`a928ad2`, `b7ee8e1`, `1e509df`), so the authority hash already catches
  them. The only capture-file commits that did *not* regenerate are the ones that move
  nothing — `7d119b9` edited four comment lines and `24c4ea9` added counts returned outside the
  baselined object. Hashing those bytes buys nothing and costs two false refusals out of four.

## What this does NOT cover, recorded as accepted debt

1. **The reseed reflex on a dirty tree.** After a refusal the geometry half needs a typed
   `UPDATE_GEOMETRY=1` run. If the tree carries uncommitted `src` edits, the new local baseline
   encodes your own change as the reference. All three options share this.
2. **A `src` or capture change that lands without a regeneration.** The authority does not move,
   so nothing fires. Narrow — zero occurrences in the measured window — but structural, because
   a delta inside linux's slack can sit outside darwin's.
3. **macOS font rasterization drift.** An OS point release changes nothing in the tree, the
   lockfile, or the browser revision. Anything short of re-rendering is a proxy.
4. **Only a Playwright run consults it.** `node tests/geometry-selftest.mjs`,
   `boundary-check.mjs` and `nav-contrast.mjs` do not.
5. **The stamp does not survive a re-clone or a copy without `.git/`.** Absence reads as
   unknown provenance and costs one refusal. It fails safe — and, unlike the delete variant,
   costs nothing but a message.
6. **The stamp reads the index, not `HEAD`.** Staging or stashing a baseline moves the
   authority with no checkout.

## Why now

DEF-65 has been open since 08-25 and has been paid for in prose ever since: every session
handoff carries a paragraph telling the next session that local red is not a defect. That
paragraph is the mechanism this repo does not have, written out by hand each time. `AGENTS.md`
is explicit that a rule which must always hold belongs in code, not in a document.

**Decision recorded as mine and not raised to the owner**, because the standing brief assigns
it: *"a decision about how a local set is invalidated, then the smallest mechanism that makes
staleness LOUD."* Nothing here changes a fact or a claim on the site, so P-18 does not reach it.
