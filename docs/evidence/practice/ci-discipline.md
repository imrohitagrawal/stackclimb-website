# CI that gates, and knows blocking from advisory

`VERIFIED` — workflow counts: **quorum-ai 13**, **citevyn 7**.

**quorum-ai** — `availability-check`, `ci`, `csp-smoke`, `deploy-drift-watchdog`, `deploy`,
`e2e`, `error-rate-check`, `eval`, `flake-scan`, `issue-hygiene`, `perf-sample`,
`seed-visual-baselines`, `test`.

**citevyn** — `ci`, `codeql`, `frontend-live-e2e`, `frontend`, `pr-quality`, `release`, `uptime`.

## The distinction, stated in the workflow itself

`VERIFIED` — `quorum-ai/.github/workflows/eval.yml`:

- *"Golden-set structural gate (hermetic, **blocking** in the default suite)"*
- *"Eval-batch latency baseline (PERF-010, **ADVISORY**)"*

Labelling which checks can stop a release and which merely inform is a maturity most teams never
reach. It also satisfies the rule that a gate shipped advisory must say what would make it blocking.

## CI watches production, not only correctness

`VERIFIED` — availability, error rate, performance sampling, CSP, deploy drift, and flake
scanning all run as workflows. That is an SRE posture expressed in CI.
