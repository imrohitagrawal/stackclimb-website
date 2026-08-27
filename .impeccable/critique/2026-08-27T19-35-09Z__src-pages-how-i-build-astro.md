---
target: src/pages/how-i-build.astro
total_score: 16
max_score: 28
na_heuristics: 7,9,10
p0_count: 1
p1_count: 5
timestamp: 2026-08-27T19-35-09Z
slug: src-pages-how-i-build-astro
---
Method: dual-agent (A: design-review subagent · B: detector/browser + content-integrity subagents). Never critiqued before; no surface brief exists.

## Design Health Score — 16/28 (Acceptable, 57%; 7/9/10 n/a)

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Three full-viewport plates, no progress signal |
| 2 | Match System / Real World | 2 | Cohen's κ, PABAK, Spearman, Kolmogorov–Smirnov all undefined |
| 3 | User Control and Freedom | 3 | No in-page route past plate 2's wall |
| 4 | Consistency and Standards | 3 | Two body sizes (14.72px band, 16px plate 3); ochre on plate 3 only |
| 5 | Error Prevention | 3 | Strong limit-disclosures; anonymous referents undercut them |
| 6 | Recognition Rather Than Recall | 1 | "one repo… another…" names nothing; "the skills above" has no antecedent |
| 7 | Flexibility and Efficiency | n/a | Linear persuade surface |
| 8 | Aesthetic and Minimalist Design | 3 | 48% grid fill; copy squeezed to 54ch beside an empty half-frame |
| 9 | Error Recovery | n/a | Static page, no error states |
| 10 | Help and Documentation | n/a | Persuade surface |

## Priority Issues

**[P0] The artefact is not a verbatim quote.** Rendered: "WHAT IT CHECKS (honest scope): whether main HEAD has a SUCCESSFUL 'Deploy to Fly.io' run — the deploy JOB, not a /health 200." Source `deploy-drift-watchdog.yml:8-11`: "WHAT IT CHECKS (honest scope), two independent questions:" / "1. Does main HEAD have a SUCCESSFUL "Deploy to Fly.io" run — the deploy JOB, not a `/health` 200 (per the deploy-job-skip-vs-health lesson)?" Two non-adjacent lines fused, list-intro reduced, interrogative made declarative, parenthetical dropped. First quote silently drops 12 words "(a dropped Actions event / skipped-or-failed deploy gate / a flake)" with no ellipsis. The page's own next plate says "the instructions themselves, not a description of them". The edit also WEAKENS the evidence: the omitted lines carry "This is a PROXY: it cannot see a Deploy run that reported success while production did not actually roll" and "on 2026-08-07 that left production 34m31s behind while every passive probe stayed green" — a dated measured incident, the strongest honesty artefact available. `how-i-build.spec.js` compares substrings against `failure-driven.md`, not the real workflow, so both distortions pass green.

**[P1] "112 authored skill directories" is 113.** `ls -d ~/Projects/quorum-ai/.agents/skills/*/ | wc -l` = 113. Stale since `project-faq` landed 2026-08-12. The spec binds the phrase "authored skill", never the digits. `docs/evidence/practice/skill-library.md:3` is stale in the same way.

**[P1] "OpenTelemetry and Prometheus across three systems" is two.** narratwin + evalaxis have both; saaf-saans uses Elasticsearch/Kibana per the evidence file itself; quorum's `fly.toml` says "no exporter is wired".

**[P1] The best asset is clipped and arrives fourth.** Artefact bottom: 772px @1440x768, 759px @1280x720, 927px @390x844 — fully visible only at 900px+ viewport height. It sits after three abstract claim bands.

**[P1] `.plate-grid.one-col` / `.plate-copy.wide` are dead classes.** Same root cause as /experience: defined only in `project.css`, never imported. 48% grid fill on all three plates.

**[P1] Horizontal scroll at 320px and 360px.** `scrollWidth 383`. `div.plate-frame` of `#evals-observability` computes 362.578px inside 320. Cause: `.plate-figure` has `min-width: 0` (`global.css:219`), `.plate-copy` does not, so its 304.578px min-content sets the floor. Adding it drops the frame to 280px. Residual at 320 is the unbreakable word "observability," at 232.2px against a 222px box.

**[P2] `band-term` is an evidence mechanism rendered as unexplained decoration.** Seven bold spans exist so the spec can bind each claim to a VERIFIED evidence line. No key is given to the reader. Six sit in `band-support` (400→700, reads); one — "the incident that caused it" — sits in `band-lead` (600→700, same size) and is invisible. Seven highlights, six different grammatical shapes, no learnable rule.

**[P2] Two of three plates share one ground.** `palette.css` hues only `#how-i-build`; `#evals-observability` and `#published-skills` both fall back to `#0e1322` and are ADJACENT — distance 0.0. Plate 2, which must answer "is the AI move real?", has no ground of its own and no lit surface.

**[P2] "Two of the skills above are public repositories" is wrong.** `.github` is a community-health repo, not a skill, as the page's own next clause says. "every other repository here inherits from" it is false for CiteVyn, which ships its own CONTRIBUTING.md and SECURITY.md.

## Measured
axe 0 violations, contrast 0 failures, focus order clean (12 stops), min type 11px. Two tap targets under 24px at 390 (repo links, 19px tall). Plate 1 = 1015px at 390x844 (1.20x svh), 1291px at 320x568 (2.27x). No-JS identical. Detector: all-caps-body false positive (an 11.2px tracked caption label); flat-type-hierarchy real (9 sizes, 7 inside 11–17px).
