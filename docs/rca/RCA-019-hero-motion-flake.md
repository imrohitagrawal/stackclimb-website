# RCA-019 — DEF-76: `tests/hero-motion.spec.js` flake under full-suite load

Package `hero-motion-flake` (DEF-76), diagnosis-first, low severity, small blast radius.

## What happened

DEF-76's ledger row cites `tests/hero-motion.spec.js:20` flaking three times on 2026-08-30
under full-suite load, passing 3/3 every time in isolation. D168 later reclassified this as a
**class**, not a single flaky test: the same "passes isolated, fails under full-suite load"
signature also hit `hero-motion.spec.js:95` (mobile only, that session) and
`nav-reach.spec.js:92`, with the note "three specs with one signature is not three flaky tests;
it is one cause nobody has found."

**Line 20's own test could not be reproduced.** Over 110 repeat runs of exactly that test,
under CPU contention equal to or heavier than what reliably breaks the test below (up to 16
Playwright workers plus 8-12 CPU-pinning `yes` processes, load average 43-99 on a 10-core
machine), it passed every time. Structurally this makes sense: its assertions either read
static CSS properties (`animation-name`, `animation-duration`, unaffected by timing) or wait on
`networkidle` (which itself blocks for >=500ms of no network activity — longer than the 80ms/
280ms animation delays it is checking) or an explicit 900ms `waitForTimeout` with real margin
before the 780ms animation completes. None of those windows are as tight as the one below.

**A mechanistically identical, reliably reproducible defect was found and fixed in the same
file, three tests later: line 95.** `'anchor deep-link: no-anim suppresses the entrance while
it holds'` took ONE `page.evaluate()` snapshot after `page.goto()` to check whether
`html.no-anim` — a transient class `src/scripts/plates.js` adds and removes via
`setTimeout(..., 400)` — was still present. Under CPU contention, the Node<->browser roundtrip
for that single snapshot can exceed 400ms, so the snapshot lands after the window has already
closed, even though the window genuinely existed and the production code behaved correctly.
Reproduced: **16/30 and 14/30 failures** across two runs at 8 parallel workers plus 8 CPU-pinned
`yes` processes (all failures: `expect(state.noAnim).toBe(true)` received `false`).

Two fixes were tried and measured to NOT remove it before the one that worked:

- `page.waitForFunction()` polling for the class instead of one snapshot — still 14-16/30
  failures under the same load. Under this level of contention the browser's own JS thread can
  be starved long enough that the polled condition never becomes true before the poll's own
  timeout either — this isn't a Node-roundtrip problem alone, it's real execution starvation.
- `page.clock.install()` — does nothing by itself. Per Playwright's own docs, timers keep
  running in real time after `install()` until `pauseAt()` is explicitly called, which just
  moves the identical race to wherever `pauseAt()` is called from.

The fix that worked: stop trying to CATCH the transient state with a well-timed read, and
instead RECORD it permanently, in-page, at the instant it happens, via a `MutationObserver`
installed with `page.addInitScript()` before navigation. The observer fires at the next
microtask checkpoint after `plates.js`'s `classList.add`/`remove` — no external roundtrip sits
between the state change and the observation, so it only has to outrun the 400ms `setTimeout`,
not the far slower Node<->browser channel. One real bug surfaced while building this: `addInitScript`
runs at document-start, BEFORE `<html>` exists (`document.documentElement` is `null` there,
confirmed by direct instrumentation) — the observer has to wait for `<html>` to appear via a
second `MutationObserver` on `document` itself, which fires the instant the parser inserts it,
well before `plates.js`'s module script can run.

**Verified fixed**: 30/30 then 40/40 under progressively heavier load (up to 16 workers, 12
CPU-pinned processes, load average 56), 0 failures both times — including at a stress level that
had made the `waitForFunction` attempt time out on every run.

**Corroborating, out-of-scope finding**: a plain (unstressed) `npx playwright test` full-suite
run during this session's own verification reproduced `nav-reach.spec.js:92` failing
("clicking the CV link did not navigate to /cv") with no synthetic stress at all — confirming
D168's class diagnosis is real and current, not historical. That file is untouched by this
package (different mechanism — a click/navigation race, not a transient-class race) and is
explicitly out of `hero-motion-flake`'s scope; left open for its own package.

## Where introduced

The original test (D85, package 4B) was written assuming a single post-navigation snapshot
would reliably land inside a ~400ms real-time window — true under light load, false under
contention. Not a coding slip so much as an untested assumption about roundtrip latency.

## Where caught

Synthetic CPU-pinned load (`yes > /dev/null` x8-12) plus `--repeat-each` reproduced the failure
on demand in this session, after the original occurrences (3x, 2026-08-30) had no captured
failure output to work from.

## Cost

Before this fix, `hero-motion.spec.js` carried a real, demonstrated race that could red a green
branch under nothing more than normal CI parallelism — exactly the danger `playwright.config.js`
retries: 0 is meant to surface rather than paper over. Left unfixed, it would keep contributing
to DEF-76's "one cause nobody has found" pile.

## Evidence

- `/tmp/pw-hero-stress.log`, `/tmp/pw-hero-fix-verify.log`, `/tmp/pw-hero-fix-verify2.log` —
  reproduction and failed-fix attempts (16/30, 18/30, 14/30 failures respectively; not committed,
  session-local).
- `/tmp/pw-hero-mutobs-fix.log` (30/30 pass), `/tmp/pw-hero-mutobs-fix2.log` (40/40 pass at
  heavier load), `/tmp/pw-hero-final-verify.log` (240/240 pass after the Codex-review tweaks) —
  the working fix, verified under load.
- `/tmp/pw-full-1.log`, `/tmp/pw-full-2.log`, `/tmp/pw-full-3.log` — three unstressed full-suite
  runs: `hero-motion.spec.js` clean in all three (36/36 test executions); only known, expected
  darwin geometry-baseline gaps (D140) failed elsewhere, plus one `nav-reach.spec.js:92` failure
  in run 2 (the corroborating, out-of-scope finding above).
- `codex exec --sandbox read-only` review, one round: verdict **approve, no CRITICAL_BLOCKER or
  REQUIRED_CONTRACT**. Three ADVISORY_DEBT findings, all fixed in the same commit: an imprecise
  comment ("same JS turn" -> "next microtask checkpoint"), a dead optional-chain after
  `getComputedStyle(null)` (which throws before `?.` can guard it — replaced with an explicit
  element-existence check), and a noted (pre-existing, not a regression) limitation that the
  recorder proves suppression at the window's start rather than continuously throughout it.
