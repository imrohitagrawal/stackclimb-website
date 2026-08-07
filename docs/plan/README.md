# Orchestration plan — build once, then maintain forever

This repo is not a website project. It is the **system that keeps a website true** as the work
it describes keeps changing.

## The idea the whole plan rests on

```
sibling repos  →  evidence base  →  site content  →  deployed site
   (truth)        (verified facts)    (claims)       (what visitors read)
```

The site is a *projection* of the evidence base. The evidence base is a *projection* of the
repos. Every maintenance problem is the same problem: **a projection has gone stale and now
asserts something that is no longer true.**

That reframes maintenance from "update the website occasionally" to "detect and repair drift,
continuously." Drift is detectable mechanically. That is what makes this automatable at all.

## Phase 1 — Build (now)

Sequential, because these depend on each other and share one working tree.

| Step | Owner | Gate before moving on |
|---|---|---|
| Fix the static-render defect | builder | a11y suite green, no-JS screenshot legible |
| Mechanize the remaining Definition of Done | builder | CI red on a seeded defect |
| Harvest the six repos into `docs/evidence/` | harvesters, **parallel** | every claim carries a status label |
| Rewrite plate content from verified evidence | author | no claim above its evidence status |
| Long-form mode for writing/docs | builder | plate world extended, not replaced |
| Wordmark | `brandkit` | survives nav, favicon, OG, mono, both themes |
| Deploy | CI | deploy job ran, build SHA matches |

## Phase 2 — Maintain (forever after)

### The loop

1. **Harvest** — one read-only agent per sibling repo, in parallel. Reads `main` only. Emits
   facts with `VERIFIED` / `REPORTED` / `UNVERIFIED` status into `docs/evidence/projects/`.
2. **Diff** — compare this harvest against the last. What changed?
3. **Audit claims** — take every claim the *live site* makes and check it against fresh
   evidence. Three outcomes: still true, now stale, **now false**.
4. **Propose** — a GitHub issue per drift item, severity-ranked. Now-false outranks everything.
5. **Implement** — one builder, one branch, one concern.
6. **Review** — independent lenses, findings refuted before action.
7. **Ship** — CI gates, deploy verified by the deploy *job*, not a health check.

Steps 1–4 are safe to automate: they only *read* and *file issues*. Steps 5–7 need a human.

### Cadence

| Trigger | Runs | Output |
|---|---|---|
| Weekly, scheduled | Harvest + claim audit | A drift issue, or silence if nothing moved |
| A sibling repo tags a release | Harvest that repo | Issue if a site claim is affected |
| On demand | Anything | Whatever was asked |
| Before any deploy | Claim audit | Blocks if a `now-false` claim is live |

**Silence is the expected result.** A weekly run that finds nothing files nothing. If it files
something every week, the detector is miscalibrated and gets fixed, not tolerated.

## Agent roles and delegation

The rule that shapes all of it: **fan out to review, never to build.** Subagents share one
working tree, so parallel writers corrupt each other. Only read-only phases fan wide.

### Read-only, parallel — fan freely

| Agent | Remit | Never does |
|---|---|---|
| **Harvester** (one per repo) | Read `main`, extract facts, label status | Write outside `docs/evidence/` |
| **Claim auditor** | Compare live site copy against evidence | Decide what the copy should say |
| **Pixel reviewer** | Judge rendered images only | Read source, DOM, or tokens |
| **UI reviewer** (`ui-ux-pro-max`) | Layout, type, colour, states | Edit anything |
| **Structure reviewer** (`taste-check`) | Special cases, nesting, dead abstraction | Edit anything |
| **Security reviewer** | Break it — headers, supply chain, secrets | Edit anything |
| **Verifier** | Try to *refute* each finding before it is acted on | Add findings of its own |

### Write — exactly one at a time

| Agent | Remit |
|---|---|
| **Author** | Copy, from verified evidence only. Cannot promote a claim's status |
| **Builder** | Implementation. Sole tree-writer. One concern per branch |

Parallel building is allowed only across **disjoint files** in separate worktrees, and only with
an explicit file-ownership list per agent. A write outside that list is a coordination bug.

### Sizing the fan

Planning and architecture get the full expert fan — that is where breadth pays. Implementation
scales to blast radius: docs → self-verify; one component → one reviewer; multi-file → parallel
fan; anything touching security, routing, or config → full fan plus a break-it reviewer.

Cost is real: multi-agent runs use roughly 15× the tokens of a single session. Fan the review,
not the construction.

## Framework

| Layer | Choice | Why |
|---|---|---|
| Site | Astro 5, static | Content collections fit blogs and docs; islands give interactivity without a framework runtime |
| Host | Cloudflare Pages | Static requests free and unlimited; same vendor as DNS; apex CNAME flattening |
| Apps | Fly.io, scale-to-zero | ~$0.08/month idle per app |
| Tests | Playwright + axe-core | Already installed; drives the real build, not the dev server |
| Visual truth | `tests/visual-walkthrough.mjs` | 29 images; the only check that sees what a visitor sees |
| CI | GitHub Actions | The only layer that binds for everyone |
| Local gates | Tracked `.claude/settings.json` hooks | Fast feedback; binds only because the file is tracked |

## How this is maintained — the part that usually rots

**Every claim on the site traces to a status-labelled line in `docs/evidence/`.** No trace, no
claim. That single rule is what makes drift detection possible: an auditor can enumerate claims
and check each one, because each one has an address.

Three properties keep the system honest about itself:

1. **Every gate states its denominator.** "47 files scanned, 0 findings" is a result. "Passed"
   is not. A gate that measures nothing must fail, not pass.
2. **Every gate is proven red.** A gate never seen failing on a deliberate defect is assumed
   broken. Prove it, then trust it.
3. **The circuit breaker.** Two review rounds, then stop. A new class of finding every round
   means the miss is upstream — requirements, planning, or understanding — and patching cannot
   fix any of those.

## What is deliberately NOT automated

- **Publishing.** No agent pushes copy live. The voice discipline — state what is proven, label
  what is not — cannot be delegated to something that has never been embarrassed.
- **Promoting a claim's status.** `REPORTED` → `VERIFIED` is a human judgement about evidence.
- **Deciding what the site should say.** Auditors report drift. They do not write.
