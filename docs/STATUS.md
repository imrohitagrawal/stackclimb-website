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
| Branch | `main` — run `git rev-list --count HEAD` for the count; do not hard-code it here |
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
| D13 | **Launch gate: SaafSaans copy + clickable contact links only.** Contrast, the 12 unchecked numbers, CI, hooks and the repo history all land *after* launch | Owner's call: live and honest, fast. Neither deferred item is *false* — one is a quality gap, the other unconfirmed-but-probably-right | 08-07 |
| D14 | **Deploy via Cloudflare Pages connected to the private repo (approach A) — temporarily** | Only option that ships today. B risks deploying a stale `dist/` (DEF-11 is exactly that failure). C puts a red, partly-broken suite on the critical path | 08-07 |
| D15 | **Approach C is the target. A is a recorded debt with a written exit condition** | See the standing notice at the top of `AGENTS.md`. A temporary state nobody mentions becomes permanent | 08-07 |
| D12 | **Skills to install** (below) | Three agent reviews, applying the how/where-not/what-not criterion | 08-07 |

### D12 — the install list, not yet executed

```
mattpocock/skills       domain-modeling, grilling, grill-with-docs        ← highest value
project-doc-skills      architecture-and-decisions  (from dist/*.skill)  ← aimed at our problem
project-doc-skills      doc-critic
obra/superpowers        verification-before-completion, test-driven-development,
                        systematic-debugging, requesting-code-review,
                        receiving-code-review, dispatching-parallel-agents
addyosmani/agent-skills code-review-and-quality, performance-optimization
addyosmani/web-quality  performance
ui-ux-pro-max repo      design-review agent (adapted, MIT) — the independent UI lens
```

Three traps:

1. **Do not install both TDD skills.** obra's and addyosmani's share a directory name; the
   second overwrites the first. obra wins on mandatory watch-it-fail.
2. **Install `project-doc-skills` from `dist/*.skill`, never by copying `skills/<name>/`.**
   The source directories are build *inputs* — `house-style.md`, `project-profile.md`, and
   `verify.py` are copied in by `build-skills.sh`. Copying the source yields dangling refs.
3. **`grill-with-docs` is a 245-byte pointer.** Its whole body is *"Run a `/grilling` session,
   using the `/domain-modeling` skill."* Install all three or it points at nothing. Also: the
   "docs" it makes are ADRs and a glossary — it does **not** fetch documentation.

### Conditional — install when the trigger fires

| Skill | Install when |
|---|---|
| `graphify` | Pointed at `docs/` and prose, never `src/` — there is no `.astro` tree-sitter grammar, so the free AST path barely applies and everything falls to the token-costing path |
| `claude-obsidian` | Only if memory living **outside** the site repo is acceptable. Its rule: *"The checkout contains the product. It is not your knowledge vault."* |
| `project-faq` | If a Q&A page is wanted. It emits generated tabbed HTML, a foreign artifact next to Astro |
| `learning-track` | If the writing section becomes a teaching series. It prescribes an 8-critic loop — heavy for one person |
| `onboarding-companion` | If someone else contributes. Doubles as a re-entry doc after a long gap |
| `operations-runbook` | If a case study covers a running service |

### Uncovered capability

**Grounding answers in fetched documentation** has no public skill I could find. `grill-with-docs`
looked like it and is not. Worth watching, since the NarraTwin avatar will need exactly this.

---

## Open — blocked on the owner

| # | Item | What is needed |
|---|---|---|
| ~~O1~~ | **Approved 08-07 and done.** Remaining contrast work is DEF-5 |
| O2 | **Repo visibility** | Rewording is done and pushed. The `gh repo edit --visibility public` call was blocked for me — run it yourself |
| O3 | **Logo files** | Not yet handed over. `docs/brand/candidates/rohit/` stays unopened until they are |

## Open — mine to do

| # | Item | Blocked by |
|---|---|---|
| M1 | ~~Static-render defect~~ **done** · now DEF-5, the opacity ramp | Nothing |
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
| ~~DEF-1~~ | — | **FIXED.** Plates now paint their own ground in static HTML; JS reclaims it via `.js-ground` before first paint | No-JS plate bg now `rgb(181,172,156)` linen vs ink text = 7.1:1. Cross-fade unchanged |
| DEF-5 | **Medium** | Colour contrast fails. **Desktop: 4 plates / 22 nodes. Mobile: 3 plates / 16 nodes** — `#private` passes at 390px and fails at 1440px. The `DESIGN.md` opacity ramp (prose 88%, labels 62%) was tuned on ink navy and fails on lighter grounds | axe per-plate scan, both projects |
| **DEF-6** | **HIGH** | **The DEF-1 fix fails open.** `.js-ground` is set by an inline script that always succeeds, while `plates.js` — which does the repainting — can throw independently. JS on + module dead = **1.03:1, 14 nodes**, the original defect in full | Architect review, by execution. RCA-002 |
| **DEF-7** | **HIGH** | **`index.astro:196` links SaafSaans as "Deployment". It does not respond.** Verified: HTTP 000 after 5.3s. CiteVyn 200 in 0.64s, Quorum 200 in 0.37s | `curl --max-time 60` |
| **DEF-8** | **Medium** | Six of seven plates **print blank** — bone text on white paper. No `@media print`, no `print-color-adjust` anywhere | Architect review, print emulation |
| **DEF-9** | **Medium** | Canonical and `og:url` are hard-coded to the home page (`Layout.astro:31,35`). Every future page will declare the home page as its canonical | Architect review |
| **DEF-10** | **Medium** | `ROUTES = ['/']` in `dod.spec.js:11` is hand-typed. Add pages and every gate silently covers one page while reporting green. Same defect in `visual-walkthrough.mjs:14` | Both reviews |
| **DEF-11** | **HIGH** | **The suite never builds.** `playwright.config.js:16` runs `astro preview`, not `astro build && astro preview`. Break the source, skip the rebuild, and every gate passes against a stale `dist/`. `reuseExistingServer` silently reuses a stale local server too | QA mutation M9 |
| **DEF-12** | **HIGH** | **Deleting content makes the suite green.** `plateIds.length > 0` is satisfied by ONE plate. Removing 6 of 7 took the suite from 1 failed / 4 passed to **5 passed** | QA mutation M7 |
| **DEF-13** | **HIGH** | **The focus test cannot fail for what it names.** It checks `outlineStyle`, `boxShadow`, `textDecorationLine` — none of which is *visibility*. A transparent outline passes | QA mutation M2 |
| **DEF-14** | **HIGH** | **Nothing outside `.plate` is scanned.** axe scopes to `#${id}`. A missing `alt` and an empty link planted in the nav went undetected | QA mutation M8 |
| **DEF-15** | **HIGH** | **`expect(widths.length).toBe(3)` goes red when coverage improves.** Adding a 4th viewport fails with "no viewports checked" — while four were checked. `AGENTS.md` bans exactly this | QA mutation M12 |
| **DEF-16** | **Medium** | Destroying the colour system makes the gate *greener*: 5 of 7 grounds set to black left the screenshot hash unchanged and dropped axe violations from 4 to 1 | QA mutation M10 |
| **DEF-17** | **Medium** | `@playwright/test: ^1.62.1` is a caret. One `npm install` moves the Chromium binary and invalidates every future baseline | `package.json` |
| **DEF-18** | **HIGH** | **Two real WCAG failures live outside `.plate`, where the suite cannot see them.** `footer > p` at **1.51:1**, `em` at **2.79:1** — the footer inherits the linen ground and keeps bone text | Verified: axe with `.exclude('.plate')`, scrolled to `#private` |
| **DEF-19** | **HIGH** | **CSP fails silently, and the bad case is the default.** Blocking *both* inline scripts is safe. Blocking *only the module* renders a complete HTTP 200 page at 1.03:1. The head script's hash never changes; the module's changes on every edit — so the head stays valid while the module goes stale | Synthesizer, three policies served |
| **DEF-20** | **Medium** | `npm audit` high is **`astro` itself** (direct dependency, 8 XSS advisories), not sharp/esbuild as first reported. Unreachable in this static build, but the fix is `5.18.2 → 7.2.0` — **two** majors | `npm audit --json` |
| **DEF-22** | **HIGH** | **Render-blocking CSS is the real critical-path defect.** 18 KB raw / 3.7 KB brotli, and it gates font discovery. Inlining it takes mobile LCP **2.4s → 1.4s**, Lighthouse 98 → 100 | Lighthouse 13.4.1 + Playwright A/B |
| **DEF-23** | **Medium** | `paint-grain.png` is **perfectly grayscale stored as 24-bit RGB** — three identical copies of one plane. Grayscale PNG saves 32% **pixel-identically**; WebP q95 saves 77% at max error 2.33/255 | Channel-spread check, rendered diff |
| **DEF-24** | **Low** | `paint-grain.png`, `og.png`, `favicon.svg` ship **unhashed** from `/public` while CSS and fonts are content-hashed. With a long `immutable` cache, a grain change never propagates | Build output |
| **DEF-21** | **Medium** | `scroll-behavior: smooth` (`global.css:18`) makes every fragment link a ~3-second animation. `?at=` is **not** vestigial — it sets `no-anim` for an instant jump. Migrating to `#` needs a settle wait or every deep-link screenshot captures mid-scroll | Synthesizer, timed |
| DEF-2 | Medium | `?at=<plate>` deep links are JS-only. Without JS the URL renders the hero | Visual walkthrough, step 24 |
| ~~DEF-3~~ | — | **KILLED. Preloading fonts made LCP *worse* in every configuration measured** — desktop +44ms, mobile +96ms. `font-display: swap` paints text instantly in fallback; a preload lands inside the block period and makes the browser wait | 7-run medians, A/B |
| DEF-4 | Low | No visual regression baselines, so alignment drift passes silently | 29 images captured, none compared |

**Measured performance baseline — the site is already fast.** Lighthouse 13.4.1: desktop **100**
(LCP 0.4s, CLS 0.007, TBT 0ms), mobile **98** (LCP 2.4s, CLS 0.002, TBT 0ms). Scroll is locked at
60fps with **zero long tasks** on both. Do not "optimise" scroll, animation, or the blend overlay.

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
| `andrej-karpathy-skills` | Not knowledge management — one 2.5 KB file duplicating the global `CLAUDE.md`. Claims MIT in frontmatter; **no LICENSE file exists** |
| `notebooklm-py` | Drives an unofficial Google API and stores a bearer credential on disk. Wrong shape for maintaining a repo's knowledge |
| `usage-guide` | Grade-2 reading level for end users operating a product. No such reader here |
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
| The architect's proof that `.js-ground` fails open | The probe did not isolate the variable — at scroll 0 the **healthy** page also shows 14 nodes at 1.03:1, because `#private` was never scrolled into view. Conclusion right, evidence invalid | A right answer from a wrong proof is still a wrong proof |
| Security: "LICENSE and RCA-002 are untracked" | Both present in `git archive HEAD`. Two false claims, each killable by one command | Widest brief, lowest floor — verify every individual claim |
| "`project-doc-skills` has dangling references" | It does not. The earlier review read `skills/<name>/`, a build **input**. The product is `dist/*.skill`, a 66 KB zip with all 16 files | Test the artifact that ships, not the source that builds it |
| "`project-doc-skills` is a poor fit" | `architecture-and-decisions` is now the **second-best** install of everything evaluated | A verdict inherited from one agent is a claim, not a finding |
