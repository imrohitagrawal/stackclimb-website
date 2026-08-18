# P-7 — evals, monitoring, observability: gap list and proposed plate

**Status: SHIPPED 2026-08-18.** Owner approved all four proposed claims in section 3, with one
amendment: strip line numbers and anything else bound to drift as the cited repos evolve — no
proposal below was rejected on substance. Each repo was re-read at its real default-branch HEAD
before shipping, closing the open provenance item this document itself flagged (citevyn `7cd8680`,
saaf-saans `10f4213`, narratwin-ai `87b8504`, evalaxis-ai `c3233de`). Built as
`docs/evidence/practice/evals-observability.md` (evidence, file names only, no line numbers) and
a new plate on `/how-i-build` (`id="evals-observability"`), gated the same way every other claim
on the page is — a term bound to a `VERIFIED` span, checked in `tests/how-i-build.spec.js`. This
document is kept as the historical record of the investigation and the fan's corrections; it is
no longer a proposal.

Implements the write-up step for P-7 (`docs/OWNER-DIRECTIVES.md` row 71). Investigation ran as
a draft gap list, then a four-role review fan (staff-engineer, eng-manager, principal-architect,
evals-specialist) checked it against the actual repos. This document is the gap list corrected
by that fan, not the original draft.

---

## 1. What was found

P-7's own status row already says what's missing from `/how-i-build`: "evals and observability
specifically... not surfaced HERE," plus a roadmap — which is not a gap, it's a decision already
made (P-8: no roadmap, sitewide, on purpose).

The investigation found real, checkable evidence for evals/observability practice across five
repos. The review fan caught three things wrong with the draft before any of it goes further.
Two were corrections to specific claims. One is more important: one of the three pillars the
draft wanted to build the new plate on turned out to be content **already on the live page**.

### What holds, after the fan's checks

- **Golden-set / regression evals** — real in citevyn, quorum-ai, narratwin, evalaxis (four
  repos, not five — see "what's wrong" below).
- **Judge-calibration statistics** — real, working code in evalaxis: Cohen's κ, PABAK,
  Spearman, bootstrap confidence intervals, and it refuses to compute κ on a fake judge
  (`meta_eval.py`). But see the caveat below — this is not yet "calibrated against human
  ratings."
- **Statistical regression gating** — real in evalaxis: an absolute-drop threshold OR a
  bootstrap-CI-crosses-zero check, proven end to end against a constructed good-vs-degraded
  scenario.
- **Threshold-gated promotion for an AI artifact** — real in citevyn: `promote_version()`
  blocks promoting a retrieval index below a measured pass rate, force-override audited either
  way.
- **Production drift detection** — real in evalaxis: a two-sample KS-test against a stored
  baseline, with floor-breach alerting. The one genuine "monitoring" find in the whole
  investigation. Built and demo-proven — not shown wired to live production traffic.
- **Tracing / metrics / dashboards** — real in narratwin (OpenTelemetry, Prometheus with a
  label allowlist, Langfuse with secret redaction), evalaxis (OpenTelemetry, Prometheus
  `/metrics`, a Grafana dashboard whose panels match the app's own metric names), and
  saaf-saans (every `/ask` call logs to Elasticsearch, with a matching Kibana dashboard
  definition — confirmed in-repo, not confirmed live).
- **Cost governance, transport-level spend blocks, safety guardrails with regression tests,
  named-incident-driven tooling** — all held up as originally described; nobody found a
  problem with these.

### What was wrong, and got fixed

**1. One repo doesn't belong in the golden-set list.** The draft counted saaf-saans as a fifth
repo with golden-set evals. It isn't one. `tests/test_llm.py` tests what goes *into* an LLM
call (message construction) — it never scores an output against an expected answer.
`tests/test_severity_needs_a_measurement.py` is a real regression test, but for deterministic
non-LLM text, not a model. There is no golden/eval file anywhere in saaf-saans. **Fixed: golden-
set evals are four repos (citevyn, quorum-ai, narratwin, evalaxis), not five. Saaf-saans's
tests get their own honest label — prompt-construction and UI-text regression tests — if they're
cited at all.**

**2. One "no dashboard" claim is checkably false.** The draft said quorum-ai has "deliberately
no HTTP route or dashboard" for its telemetry. It has one: `/ui/ops`, a real SLO dashboard
(availability, latency, error rate, saturation, dependency health) with its own end-to-end
test and screenshot, on top of a live Prometheus `/metrics` endpoint. What's actually true and
narrower: that dashboard shows generic SRE signals, not the billing/token/judge-cost fields
that live in a separate file (`telemetry_sink.py`). **Fixed: quorum-ai has a dashboard. It just
doesn't have one over its AI-cost telemetry specifically.**

**3. The most important one — a proposed pillar of the new plate is already on the page.**
The draft's closing recommendation leaned on "blocking-vs-advisory eval CI, across four
repos" as one of three pillars for the new plate. One of those four repos is quorum-ai, and
its blocking-vs-advisory quote — *"a golden-set gate is hermetic and blocking; a latency
baseline is advisory"* — is **already rendered, verbatim, on `/how-i-build` today**
(`src/pages/how-i-build.astro:38-47`, sourced from `docs/evidence/practice/ci-discipline.md`).
P-7's own status row already draws this line: "golden-set gates, blocking-vs-advisory" is the
part `/how-i-build` **already covers**; "evals and observability specifically" is the part it
doesn't. Citing the same quorum-ai quote again as the fix for a gap it's already filling is
circular. **Fixed: this pillar narrows to two repos that are genuinely new** — citevyn's
judged-answer-quality gate (trigger-scoped to a tag push, manual dispatch, or a `full-eval`
label, not a blocking/advisory label the way quorum-ai's is) and narratwin's `eval-smoke.yml`,
which runs a real fixture-backed suite and is one of ten contexts a script enforces live
against branch protection. These are two different mechanisms from quorum-ai's — don't
describe all three as "the same pattern."

**4. The judge-calibration claim overreaches on one word: "human."** evalaxis's calibration
code is real and rigorous. But its own governing decision record, ADR-0015, says the
`human_score` values it calibrates against are **"provisional AI-seeded calibration labels...
explicitly not blind human labels"** — generated by applying the rubric algorithmically, with
real human review still pending. The same record warns this risks "AI judging AI" agreement
inflation. **Fixed: this ships as "built calibration statistics, real and rigorous" — not as
"calibrated against human ratings." That phrase is not earned yet.**

### An open item the fan raised twice, independently — not yet resolved

Two reviewers (eng-manager, principal-architect), working separately, both found that the
repos read for this investigation were **not on their default branches** — narratwin was on a
feature branch with local uncommitted changes; citevyn was on a feature branch; saaf-saans was
on a feature branch. Both re-checked the specific claims against `origin/main` /
`origin/master` and confirmed they hold. But this investigation, as written, doesn't say which
commit or branch backs each citation — the same failure mode AGENTS.md already names by name
("he said a 250-line rule existed; a search said it did not; the search was wrong because it
read feature branches"). **Unresolved, flagged for the owner:** nothing in section 3 should be
promoted into an evidence file without first re-reading each cited repo at its actual `main`
(or `master`) HEAD and recording the commit SHA — matching the pattern the evidence base
already uses (`docs/evidence/README.md`: "measured at `df8cfc3`"). This is process, not a
content dispute — no reviewer disagreed on what the fix should be, only on whether it's
already done. It isn't.

---

## 2. Why now

`/how-i-build` exists and is live (D88). Its own status row names the exact hole: evals and
observability aren't covered, even though two owner repos (SaafSaans, EvalAxis) carry real
evaluation practice. That's not a hypothetical gap — it's the page's own ledger entry saying
so. The investigation above confirms there's enough real, verifiable material to close it
honestly, once the three fixes above are applied. Nothing here is urgent; nothing here is
blocking anything else. It's ready to ask about because the fan already found and fixed the
weak spots, which is cheaper to do now than after copy is written.

---

## 3. What would ship — PROPOSED, not decided

**This is a draft for sign-off, not a plan already approved.** Per P-18, presentation is
delegated but claims and self-descriptions are the owner's decision. Nothing below is copy —
it's the claim, its source, and how it would be gated, for him to approve, amend, or reject.

If approved, the mechanism matches the page's existing pattern exactly: a new
`docs/evidence/practice/*.md` file per claim (e.g. `evals-observability.md`), each fact marked
`VERIFIED` and pinned to a commit SHA off the repo's real default branch (closing the open item
above), then a term-binding assertion added to `tests/how-i-build.spec.js` following its
existing `verifiedSpans()` pattern — so a claim can never render unless its exact term sits
inside a `VERIFIED` span, the same protection every other plate on the page already has.

**Proposed claim 1 — judge calibration, stated honestly.**
"Built calibration statistics for scoring judges — Cohen's κ, PABAK-weighted agreement,
Spearman correlation, bootstrap confidence intervals — that refuse to run when the judge under
test isn't a real signal." Source: `evalaxis-ai/src/evalaxis/calibration/meta_eval.py`
(path and commit to be re-confirmed against `origin/main` before it ships). Must NOT say
"calibrated against human ratings" — evalaxis's own ADR-0015 states the current labels are
AI-seeded, not blind human labels.

**Proposed claim 2 — production drift detection.**
"A statistical test (KS-test) that watches a model's output distribution against a stored
baseline and alerts on a floor breach." Source: `evalaxis-ai/src/evalaxis/monitoring/drift.py`
and `alerts.py`. Must say "built and demo-proven" — not "monitoring production" — because it
hasn't been shown wired to live traffic.

**Proposed claim 3 — tracing, metrics, and dashboards, three repos.**
"OpenTelemetry tracing, Prometheus metrics, and a dashboard whose panels match the metrics the
code actually emits" (narratwin + evalaxis), plus "every model call logged to Elasticsearch,
with a Kibana dashboard defined on those same fields" (saaf-saans). Sources: narratwin's
telemetry module, evalaxis's `obs/metrics.py` + its Grafana dashboard JSON, saaf-saans's
request logging + Kibana definition. Must say "instrumented and dashboarded per the repo" for
saaf-saans — no fresh check confirms a live Kibana instance is receiving this data today.

**Proposed claim 4 — CI that separates blocking evals from advisory, narrowed to what's new.**
"A judged answer-quality gate that only runs on a tag push, a manual dispatch, or an explicit
`full-eval` label — not on every push, with the cost tradeoff stated in the workflow itself"
(citevyn, `ci.yml:221-275`), and "a fixture-backed eval-smoke suite enforced live as one of ten
required branch-protection contexts" (narratwin, `eval-smoke.yml` +
`verify_branch_protection.py`). Must NOT reuse quorum-ai's blocking/advisory quote — it's
already rendered on this exact page.

Four claims, four new evidence-file entries, four new test assertions. Nothing more than that
is proposed for this round.

---

## 4. What does not ship

- **A roadmap.** Already decided, sitewide, under P-8. Not reopened here.
- **Saaf-saans as a golden-set-eval citation.** It doesn't have one. If saaf-saans is cited at
  all in this area, it's for its request-logging/dashboard evidence (claim 3), not for evals.
- **"Calibrated against human ratings."** The code is real; the labels it calibrates against
  are AI-seeded per the project's own decision record. Ships as "built calibration statistics,"
  not "validated against human judgment."
- **Quorum-ai's blocking/advisory quote, a second time.** Already live on this page. Reusing it
  for a new plate would be citing the same artifact twice under two different pretenses — the
  page's own gating test checks term-to-VERIFIED binding, not cross-plate duplication, so
  nothing would catch this mechanically. Caught here instead.
- **"Quorum-ai has no dashboard."** False as written. If quorum-ai's telemetry is mentioned at
  all, it's "no dashboard over its AI-billing telemetry specifically" — it does have `/ui/ops`
  for generic SRE signals.
- **Any Column-B item as a positive claim** (pass@k trial isolation, embedding-drift detection,
  staged registry with human approval, shadow deployment, canary + statistical analysis,
  human-annotation queues, continuous-evaluation feedback loops, cross-project incident
  registers). None of these were found anywhere in the six owner repos. They stay as the
  record of what was checked and not found — useful for the next audit, not for the site. If
  any of that language ever becomes site copy describing "industry practice," it would need
  its own external source, the same way the site already bars unattributed claims about
  itself — right now it's internal audit scaffolding only.
- **narratwin's Stage 2 "AI Safety" gate as currently-honored** — confirmed to exist, not
  confirmed to be currently passing (`make stage2-quality` wasn't run).
- **narratwin's Heartbeat evidence scripts as incident-driven** — the code and CI wiring are
  confirmed; the link to a specific named incident is not.
- **quorum-ai's 10/10 accuracy pilot as a fresh number** — it's a cited historical figure from
  a past PR, not re-measured here.
- **quorum-ai's trust-calibration suite as "currently passing"** — confirmed to exist and run
  in CI; not independently executed in this pass.
- **saaf-saans's `attack_demo.py` as "incident-driven tooling"** — it's a demo/red-team script,
  not a postmortem-born tool. Don't upgrade it the way `failure-driven.md` does for quorum-ai's
  deploy-drift-watchdog.
- **Nothing above ships until the open provenance item is closed** — every repo re-read at its
  real `main`/`master` HEAD, with the commit SHA recorded per file, matching how every other
  entry in `docs/evidence/` already states "measured at `<sha>`."

---

## What I need from you

Approve, amend, or reject the four proposed claims in section 3. If approved, next session
re-reads each cited repo at its default-branch HEAD, writes the evidence file with pinned
commits, adds the four test assertions, and only then touches `how-i-build.astro` — same order
as every other package on this page.
