# An authored engineering practice library

`VERIFIED` — `~/Projects/quorum-ai/.agents/skills/` holds **113** authored skill directories;
`.claude/skills/` holds a further **10**. Counts per repo:

| Repo | `.agents/skills` | `.claude/skills` |
|---|---|---|
| quorum-ai | 113 | 10 |
| citevyn | 3 | 4 |
| saaf-saans | 0 | 0 |
| narratwin | 0 | 0 |

## Coverage spans the delivery lifecycle, not just coding

| Stage | Sample skills |
|---|---|
| Discovery & requirements | `requirements-engineering`, `requirement-quality-gate`, `acceptance-criteria-quality-gate`, `stakeholder-discovery`, `opportunity-solution-tree-builder` |
| Architecture | `architecture-and-decisions`, `clean-architecture-enforcer`, `domain-modeling`, `vertical-slice-builder` |
| Security | `security-threat-modeling`, `owasp-control-mapper`, `devsecops`, `supply-chain-security`, `prompt-injection-defense` |
| AI-specific risk | `ai-safety-grounding`, `grounding-contract-builder`, `llm-evaluation`, `model-risk-register`, `prompt-registry-manager` |
| Test engineering | `test-architecture`, `contract-testing`, `resilience-testing`, `mutation-flaky-test-manager`, `accessibility-testing` |
| Operations & SRE | `sre-observability`, `operations-runbook`, `incident-drill`, `production-readiness-review`, `cost-finops` |
| Governance | `traceability-management`, `traceability-graph-gate`, `change-control`, `nfr-measurability-gate` |

## Skills that govern skills

`VERIFIED` — `skill-router-orchestrator`, `skill-conflict-moderator`, `skill-contract-auditor`,
`skill-research-librarian`, `external-skill-discovery-advisor`,
`external-skill-onboarding-manager`, `external-skill-security-auditor`, `factory-orchestrator`,
`subagent-driven-development`, `session-continuity-manager`.

This is the compounding loop: work yields lessons, lessons become skills, and other skills route
between them, detect conflicts, audit contracts, and security-review anything adopted externally.

## `.github` — the shared template source, not a skill

`VERIFIED` — `gh api repos/imrohitagrawal/<repo>/community/profile` (2026-08-28) against all four
project repos this site links to — quorum-ai, citevyn, saaf-saans, narratwin-ai — reports every
one of them serving `code_of_conduct_file` from `imrohitagrawal/.github/blob/main/
CODE_OF_CONDUCT.md`, not from its own tree. quorum-ai and saaf-saans also inherit
`CONTRIBUTING.md` this way (neither has its own); citevyn and narratwin-ai inherit
`PULL_REQUEST_TEMPLATE.md` or `CONTRIBUTING.md` respectively while supplying some files of their
own — not all-or-nothing, but every repo inherits at least one. `.github` itself holds no
`SKILL.md` anywhere (`find ~/Projects/dot-github -iname SKILL.md` — no output) — it is GitHub's
community-health-file mechanism, not a skill.

## Why it matters for the site

Clearest available evidence for full-lifecycle enterprise thinking. Most portfolios show
features; this shows requirement gates, threat models, FinOps, incident drills, and
traceability — the apparatus separating a demo from an operable system.
