# Status

The ledger. What is decided, what is open, and what was rejected so it does not come back.

Updated in the same change that alters any of it. If this file and the chat disagree, this file
is wrong and must be fixed — chat is not a record.

Last updated: 2026-08-07

---

## Where the project is

| | |
|---|---|
| Repo | `github.com/imrohitagrawal/stackclimb-website` · **private, awaiting the owner's command to go public** |
| Branch | `main` · 6 commits |
| Site | Home page built — 7 plates, authored SVG figures, ruled caption strips |
| Deployed | **No.** Nothing is live. `stackclimb.com` apex still resolves to nothing |
| Tests | Definition-of-Done suite (10 pass, **2 fail — real defect**), visual walkthrough (29 images) |
| CI | **None.** Every rule in `AGENTS.md` is influence, not enforcement |

---

## Decided

| # | Decision | Why | Date |
|---|---|---|---|
| D1 | **Extend the portrait-plate world, do not replace it** | Execution is strong; the problem is structural — "one plate, one viewport" cannot hold a blog post or a long résumé. Split by job instead | 08-07 |
| D2 | **Cloudflare Pages for the apex; Fly.io for app subdomains** | Static requests free and unlimited; same vendor as DNS; apex CNAME flattening. Fly idle cost ≈ $0.08/app/month | 08-07 |
| D3 | **Spend nothing on warm machines until a cold start actually hurts** | Owner's call, and correct — no traffic exists yet | 08-07 |
| D4 | **Keep Astro** | Content collections fit blogs and docs; islands give interactivity without a framework runtime | 08-07 |
| D5 | **Availability language stays; playbook language goes** | Saying "roles sought, open to relocation" is ordinary. Publishing the success metric is a playbook | 08-07 |
| D6 | **Private work is framed by a standard, not an adjective** | "Big" or "ambitious" would be an unearned superlative. "Judged on finished work rather than intent" says the same thing and is true | 08-07 |
| D7 | **The builder is never the auditor** | `impeccable` builds and audits. Its audit may "only recommend commands from: /impeccable …", so a problem outside its command set is one it cannot name | 08-07 |
| D8 | **File budget: 250 lines / 32,000 bytes / 120 chars** | Inherited from NarraTwin `ADR/0047:55`. Pre-existing files grandfathered at 500 and may not grow | 08-07 |
| D9 | **Review is capped at two rounds, with a circuit breaker** | A new class of finding every round means the miss is upstream — requirements, planning, or understanding. Patching cannot fix those | 08-07 |
| D10 | **Never write a skill that exists in public** | Public skills from known authors are tested by many people. One written here in an afternoon is shallow | 08-07 |
| D11 | **Plain English, lead with the answer, no AI filler** | Owner had to ask twice. Now a rule loaded every session | 08-07 |
| D12 | **Skills to install** (below) | Three agent reviews, applying the how/where-not/what-not criterion | 08-07 |

### D12 — the install list, not yet executed

```
obra/superpowers        verification-before-completion, test-driven-development,
                        systematic-debugging, requesting-code-review,
                        receiving-code-review, dispatching-parallel-agents
addyosmani/agent-skills code-review-and-quality, performance-optimization
addyosmani/web-quality  performance
project-doc-skills      doc-critic
ui-ux-pro-max repo      design-review agent (adapted, MIT) — the independent UI lens
```

Do **not** install both TDD skills — obra's and addyosmani's share a directory name and the
second overwrites the first. obra wins on mandatory watch-it-fail.

---

## Open — blocked on the owner

| # | Item | What is needed |
|---|---|---|
| O1 | **The a11y fix** | Go or no-go. Asked three times, still unanswered. Blocks the most work |
| O2 | **Repo visibility** | Rewording is done and pushed. The `gh repo edit --visibility public` call was blocked for me — run it yourself |
| O3 | **Logo files** | Not yet handed over. `docs/brand/candidates/rohit/` stays unopened until they are |

## Open — mine to do

| # | Item | Blocked by |
|---|---|---|
| M1 | Fix the static-render defect (see Defects) | O1 |
| M2 | Install the D12 skill list | Nothing |
| M3 | Visual **regression** baselines — `toHaveScreenshot`, generated in the CI container | Nothing |
| M4 | CI workflow + a tracked `Stop` hook | Nothing |
| M5 | Deep links `?at=` work without JavaScript | O1 (same area) |
| M6 | Font preload — zero `rel="preload"` on a font-driven page | Nothing |
| M7 | `og.png` 332K + `paint-grain.png` 164K = 60% of the build | Nothing |
| M8 | Harvest the six sibling repos into `docs/evidence/projects/` | Nothing |
| M9 | NarraTwin avatar as the site's representative | NarraTwin's own No-Go |

---

## Defects found and not yet fixed

| ID | Severity | What | Evidence |
|---|---|---|---|
| DEF-1 | **High** | The private plate is unreadable without JavaScript. Plate grounds are painted only by the scroll handler, so static HTML ships ink text on ink navy | Measured 1.03:1. With JS: 7.1:1. Screenshot confirms |
| DEF-2 | Medium | `?at=<plate>` deep links are JS-only. Without JS the URL renders the hero | Visual walkthrough, step 24 |
| DEF-3 | Low | No `rel="preload"` for fonts on a page whose LCP is a Bodoni headline | `grep -c 'rel="preload"' dist/index.html` → 0 |
| DEF-4 | Low | No visual regression baselines, so alignment drift passes silently | 29 images captured, none compared |

---

## Rejected — do not re-propose without new information

| Option | Why rejected |
|---|---|
| WordPress | $300/yr, wrong runtime for authored interactive graphics, and it argues against a reliability engineer's own positioning |
| DigitalOcean App Platform | 1 GiB transfer on the free static tier; $5/month per always-on container against Fly's $0.08 idle |
| Vercel | Hobby tier prohibits commercial use; Pro is $20/user/month |
| Migrating apps off Fly to Cloud Run | Saves pennies, costs a GCP project, Artifact Registry, IAM, and three migrations |
| Replacing the plate world entirely | Would rebuild six authored figures and the leader-line interaction to solve a page-structure problem |
| `phuryn/pm-skills` | 66 of 68 fail the how/where-not/what-not test. `positioning-ideas` would drag competitor-matrix framing into the copy |
| `security-and-hardening` | Five of six sections are server-side. This site has no server, no auth, no database |
| `VoltAgent`, `agentskills`, `vercel-labs`, `wednesday-solutions` | Two are not skills at all. The others are React/runtime-bound |
| Writing our own visual-review skill | `design-review` already exists, MIT, and is battle-tested |

---

## Corrections — mistakes made, kept so they are not repeated

| What I claimed | What was true | Lesson |
|---|---|---|
| "CiteVyn uses Arize" | 27 matches were all the word **"summarize"** | A substring is not a token |
| "No file-size rule exists in NarraTwin" | It does — `ADR/0047:55`. I searched feature branches, not `main` | Read `main` |
| "You have no engineering skills" | `SKILL_LOCK.md` locks Addy Osmani, GitHub Spec Kit, and PM Skills | Scope a claim to what was actually checked |
| "Fonts are 76% of the payload" | Fonts are `unicode-range` subset; real cost ~91K. Two PNGs are 60% | Measure what is fetched, not what exists |
| "ui-ux-pro-max has independent heuristics" | 115 of its 208 rules cite the same WCAG/HIG standards impeccable uses | Independently compiled is not independently derived |
| "Going public needs one reworded line" | Four lines across three files; `PRODUCT.md` was worse | Scan before asserting scope |
