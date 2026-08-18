# Evals, monitoring, and observability — the gap `/how-i-build` didn't cover yet

`VERIFIED` — every fact below was re-read directly off each repo's own real default branch (not
a feature branch), pinned at a commit: **evalaxis-ai** `c3233de`, **narratwin-ai** `87b8504`,
**citevyn** `7cd8680`, **saaf-saans** `10f4213`. No line numbers are cited on purpose — a repo
under active development moves; a repo name and a file name age better than a line range does.

## Judge calibration

`VERIFIED` — evalaxis-ai's calibration harness (`calibration/meta_eval.py`) scores a labeled set
with Cohen's κ, PABAK, and Spearman correlation, plus a bootstrap confidence interval on the
pooled score, and **refuses to compute a number at all** when the judge under test is a fake —
a hash-based stand-in used only to prove the harness runs, never a real judgment. The project's
own decision record (`docs/adr/0015`) states plainly that the labels this calibrates against are
**explicitly not blind human labels** — provisional and AI-seeded instead. The claim here is
built calibration statistics, real and rigorous — not validation against human judgment, which
hasn't happened yet.

## Production drift

`VERIFIED` — evalaxis-ai's monitoring module runs a two-sample Kolmogorov–Smirnov test
(`monitoring/drift.py`) comparing a live output distribution against a stored baseline, and
fires an alert (`monitoring/alerts.py`) — an **alert on a floor breach** when a metric's
windowed mean drops below its configured floor. Demo-proven end to end against a constructed
good-vs-degraded run. Not yet shown wired to
live production traffic — that distinction is kept in the claim, not smoothed over.

## Tracing, metrics, and dashboards

`VERIFIED` — narratwin-ai emits OpenTelemetry traces and Prometheus counters/histograms
(`observability/traces.py`, `observability/metrics.py`) with every metric label bounded against
an explicit allowlist, and strips any Langfuse trace attribute whose key contains "token" or
"secret" **before it leaves the process**. evalaxis-ai runs the same OpenTelemetry/Prometheus
pair with a Grafana dashboard provisioned against it. saaf-saans logs model interactions to
Elasticsearch (`services/es.py`, across dedicated advisory/telemetry/security indices) with a
matching Kibana dashboard defined in-repo — confirmed in the code, not confirmed against a live
cluster.

## CI that separates blocking from advisory — two more mechanisms, not a repeat

`VERIFIED` — narratwin-ai enforces a fixture-backed eval-smoke suite as one of **eleven**
contexts a script (`scripts/ci/verify_branch_protection.py`) checks live against GitHub's own
branch-protection API — not just against a workflow file that could silently stop being
required. citevyn runs a judged answer-quality gate deliberately *not* on every push (an
LLM-judged check costs real money and is non-deterministic run to run) but on a release tag, a
manual dispatch, or a pull request **labelled full-eval** — with the tradeoff of an ordinary
merge shipping ungated stated directly in the workflow's own comments. This is a different
mechanism in each repo, not the same quorum-ai pattern already on this page cited a second time.

## What this deliberately does not claim

No claim here says any of this is wired to live production traffic beyond what's stated above
(drift detection and saaf-saans's Kibana dashboard are both demo/in-repo, not confirmed live).
No claim says the calibration labels are human-validated. No claim reuses quorum-ai's
blocking/advisory quote, which already renders elsewhere on this page. Practices researched
against industry sources but not found in any of these five repos — pass@k trial isolation,
embedding-drift detection, shadow deployment, canary analysis, human-annotation review queues —
are not claimed anywhere on this page.
