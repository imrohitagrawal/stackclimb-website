# Status

The ledger. What is decided, what is open, and what was rejected so it does not come back.

Updated in the same change that alters any of it. If this file and the chat disagree, this file
is wrong and must be fixed — chat is not a record.

Last updated: 2026-08-08

---

## Where the project is

| | |
|---|---|
| Repo | `github.com/imrohitagrawal/stackclimb-website` · **private, awaiting the owner's command to go public** |
| Branch | `main` — run `git rev-list --count HEAD` for the count; do not hard-code it here |
| Site | Home page built — 7 plates, five record cards each quoting a named file at a named commit, ruled caption strips |
| Deployed | **Yes, 08-08.** `stackclimb.com` and `www` both serve HTTP 200 from Cloudflare Pages project `stackclimb`, production branch `main`, cert CN=stackclimb.com valid to 24 Oct 2026. Two CNAMEs added by the owner; the three Fly subdomains were verified unchanged before and after |
| Tests | `npx playwright test` on `fix/qa-review-findings`: **18 pass, 0 fail** (08-08). The contrast gate is green for the first time. `tests/boundary-check.mjs` measures plate seams; run it with `--legacy` to watch it go red |
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
| D16 | **The SaafSaans origin ships with no duration at all, rather than a labelled one** | The approved spec (`specs/2026-08-07-launch-scope-design.md:36`) allowed the three-hour figure if labelled owner-stated. Dropping it is better: the site's whole subject is claims that survive a check, and a labelled figure still invites the reader to check a number that cannot be checked. What replaced it — entered at the event, as an app that already existed, rebuilt over the next three days — is checkable line by line in `saaf-saans`' commit log and case study | 08-08 |
| D23 | **Headline becomes the full positioning line: "AI systems that show their work and refuse to fake it"** | It is already his own line in `PRODUCT.md`. The current headline truncates it and claims half. "From customer ambiguity to production evidence" is kept as a candidate for the Operating Model page, not the home hero — it describes his process, not his systems | 08-08 |
| D24 | **The voice rule is amended: his urgency is banned, the reader's problem is not** | I read "never pitches, never signals urgency" as forbidding copy that names a reader's pain, and raised it as a blocker. The owner drew the distinction I had collapsed and he is right. Recorded in `AGENTS.md` with a table of allowed and not-allowed, so the next session does not re-litigate it | 08-08 |
| D25 | **Build an Engineering Operating Model page, with labelled employment evidence** | The strongest answer to "is the AI move real or four weekend projects" — fourteen years of practice, not four repos. Already implied by `PRODUCT.md:85` and by D1. Oracle's MTTD −35% and cycle-time −25% ship **labelled self-reported**; the owner's call is that employment evidence is what people trust | 08-08 |
| D26 | **"Shift-left by default, shift-right by design" leaves the hero and moves to the Operating Model page** | True to him and in `PRODUCT.md`, but it is QA vocabulary and the single phrase most likely to mis-bucket him as a test lead in a thirty-second skim. The substance stays in the hero in plain words; the phrase appears where context defends it | 08-08 |
| D21 | **Every figure carries a real, dated artefact — one shared `Artefact.astro`, not five drawings** | The four project figures drew grey lorem bars, which against the new near-black grounds read as an unfinished wireframe on a page headlined "AI that shows its work". Each now quotes a named file at a named commit: CiteVyn's recorded golden run, Quorum's readiness decision, SaafSaans counted at HEAD, NarraTwin's No-Go. Rule recorded in `DESIGN.md` as The Lit-Surface Rule | 08-08 |
| D22 | **Quorum-AI's hand-authored fixtures were rejected as a source** | `_handoff-s4-golden-draft/golden-cases.json` carries a full four-model synthesis and would have made a convincing figure. Its own metadata reads "HAND-AUTHORED, REAL-SHAPED fixtures... NOT captured production runs. No case is a real run." Using it would have put invented system output on the site. The readiness review was used instead | 08-08 |
| D18 | **The value ladder replaces the flat palette. Portrait Plates is kept, not discarded** | Owner's call after `/impeccable critique` scored 21/32. Six of seven grounds sat in a 14-point lightness band, so the page read as printed rather than lit — that, not hue, is what "dark and dull" and "1980s, 1990s" described. Hues are unchanged at 41–47% saturation; only lightness moved. Recorded in `DESIGN.md` under The Value Ladder | 08-08 |
| D19 | **The hero mannequin is gone, replaced by real CiteVyn output** | Owner: "childish", and "I always forget this dummy". It also broke `DESIGN.md:258` — "Don't draw people" — which the design system had already written down and not enforced. The replacement is a verbatim refusal from `citevyn/backend/artifacts/golden_report.json`, case `claude_api_006`, recorded 17 July 2026. Not written for the website: a page promising "AI that shows its work" cannot illustrate itself with an invented answer | 08-08 |
| D20 | **The costume metaphor is off the site** | The garment captions (JACKET · CiteVyn, VEST · SaafSaans) and the GROUND/CLOTH/THREAD swatch tags are deleted. The swatches printed 21 lines of type describing the site's own paint, in the highest-value space on every plate, and two of three lines were identical by rule. The corner now carries the plate's **state**, which is the fact the audience came for | 08-08 |
| D17 | **The certificate clause is off the site.** The plate states only what the endpoint returns | The spec read the certificate from Fly's record, not from the endpoint. Asked today, the endpoint presents no certificate at all, so "the certificate is valid" cannot be confirmed from where a visitor stands. What *is* confirmable stayed: the name resolves and the connection is accepted | 08-08 |

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

| # | Open item | Note |
|---|---|---|
| **O-HERO** | **The hero refusal card does not state its own conclusion** | Owner's challenge, and it is correct. `golden case claude_api_006` is internal vocabulary; "What is the capital of France?" reads as trivial; the point lives only in a 0.74rem caption. **Worst reading: a glance sees REFUSED against an easy question and concludes the system is broken** — the card can be read as evidence against him. Two candidate fixes: (a) put the conclusion in the card as its largest text, (b) move the refusal to the CiteVyn plate and give the hero the overview instead. Not decided |
| **O-OVERVIEW** | **The bird's-eye overview was never built, and was never named as a finding** | The critique snapshot mentions "overview"/"summary" **zero times** while finding every symptom. It is D1 (07 Aug), unexecuted. Shape agreed: a contact-sheet plate after the hero, one row per system — what it does, its state, one hard number |
| **O-30SEC** | **The 30–60 second test is now the home page's acceptance criterion** | Owner's words: a recruiter should feel "I should call this person". Three things work against it today: his name renders at 18.24px against a 96px headline, `Seeking` lists five job titles, and there is no CV link anywhere |
| **O-SKILLGAP** | **No installed skill covers positioning or messaging** | Every skill installed is UI, code quality or docs. Search GitHub before authoring one; record what was searched and why each candidate failed |


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
| ~~DEF-5~~ | — | **FIXED 08-08 by the value ladder.** Desktop and mobile now scan clean, 18/18. Was: **Desktop 4 plates / 22 nodes, Mobile 3 plates / 16 nodes** — `#private` passes at 390px and fails at 1440px. The `DESIGN.md` opacity ramp (prose 88%, labels 62%) was tuned on ink navy and fails on lighter grounds | axe per-plate scan, both projects |
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
| ~~DEF-18~~ | — | **WRONG AS LOCATED, and now moot.** Neither element is in the footer: `dl .row dt` and `.site-nav .brand em` both live in `#top`, and they only measured 1.51:1 / 2.79:1 while the linen ground was painted — the same root cause as DEF-30. The real footer measured 0 violations at both viewports. Fixed by DEF-30's fix | Assessment B, per-plate axe with each plate in view |
| **DEF-19** | **HIGH** | **CSP fails silently, and the bad case is the default.** Blocking *both* inline scripts is safe. Blocking *only the module* renders a complete HTTP 200 page at 1.03:1. The head script's hash never changes; the module's changes on every edit — so the head stays valid while the module goes stale | Synthesizer, three policies served |
| **DEF-20** | **Medium** | `npm audit` high is **`astro` itself** (direct dependency, 8 XSS advisories), not sharp/esbuild as first reported. Unreachable in this static build, but the fix is `5.18.2 → 7.2.0` — **two** majors | `npm audit --json` |
| **DEF-22** | **HIGH** | **Render-blocking CSS is the real critical-path defect.** 18 KB raw / 3.7 KB brotli, and it gates font discovery. Inlining it takes mobile LCP **2.4s → 1.4s**, Lighthouse 98 → 100 | Lighthouse 13.4.1 + Playwright A/B |
| **DEF-23** | **Medium** | `paint-grain.png` is **perfectly grayscale stored as 24-bit RGB** — three identical copies of one plane. Grayscale PNG saves 32% **pixel-identically**; WebP q95 saves 77% at max error 2.33/255 | Channel-spread check, rendered diff |
| **DEF-24** | **Low** | `paint-grain.png`, `og.png`, `favicon.svg` ship **unhashed** from `/public` while CSS and fonts are content-hashed. With a long `immutable` cache, a grain change never propagates | Build output |
| **DEF-21** | **Medium** | `scroll-behavior: smooth` (`global.css:18`) makes every fragment link a ~3-second animation. `?at=` is **not** vestigial — it sets `no-anim` for an instant jump. Migrating to `#` needs a settle wait or every deep-link screenshot captures mid-scroll | Synthesizer, timed |
| ~~DEF-25~~ | — | **FIXED.** The SaafSaans plate claimed a "three-hour build" started at the event. Nothing in `saaf-saans` records a duration. The three commits on 18 July land 14:17, 14:49 and 15:21 — **inside** the event, which ran 09:00–17:30 IST. The first is titled "existing UI baseline"; the linked case study's timeline row reads "Before 18 Jul — Built for a hackathon as a 4-tab Streamlit app. Did not place." Copy now says the project was **entered** at the event as a four-tab Streamlit app that already existed | `git log` in `saaf-saans` (master); `docs/CASE-STUDY.md:32` |
| ~~DEF-26~~ | — | **FIXED.** The same plate said "the certificate is valid and the address resolves". Half true. The name resolves (`66.241.125.120`) and TCP 443 accepts, but the server closes the connection without presenting a certificate. Copy now states only what a command returns | `nc -z 66.241.125.120 443` succeeds; `openssl s_client` → "unexpected eof while reading" during init |
| ~~DEF-27~~ | — | **FIXED.** Relocation was stated twice in two wordings — hero ledger "Relocation / Open worldwide" and contact ledger "Open to / Global relocation · international travel" — in the change whose commit message said nothing was said twice. The hero row was removed; the contact row carries strictly more (it also states international travel) | `index.astro:52` and `:356` before the fix |
| ~~DEF-28~~ | — | **FIXED.** `tests/contact.spec.js` had **nine** holes and could not fail for what its own header claimed. Deleting the whole contact plate passed; `body { display: none }` passed; two unlabelled links passed. Rebuilt, with every hole proved closed by a watched mutation | Three reviewers, five holes found only by a different model family |
| **DEF-29** | **Low** | **Open, found while fixing DEF-27 and deliberately not fixed here.** The location is still stated twice, *verbatim*: `index.astro` hero ledger `Base — Bengaluru, India · IST (UTC+5:30)` and contact ledger `Based — Bengaluru, India · IST (UTC+5:30)`. Same value, near-same label. It is the same defect class as DEF-27 and arguably worse, but it was outside the approved brief, and `AGENTS.md` puts the RCA and the approval before the change. Needs a decision on which block owns the fact | `grep -n 'Bengaluru' src/pages/index.astro` returns two rows |
| ~~DEF-30~~ | — | **FIXED 08-08. Content was invisible at every plate seam, on the live site.** `.js-ground .plate { background: transparent }` meant one ground was painted at a time, but 94% of desktop scroll positions show two plates. Measured: private text on the contact ground at **1.03:1**, narratwin on private at **1.77:1** — the top 468px of a plate unreadable while scrolling past it. Every plate now paints itself; worst seam **7.56:1** | `tests/boundary-check.mjs`, before and after, plus screenshot |
| ~~DEF-31~~ | — | **FIXED 08-08. Two stale numbers were on the CiteVyn plate.** "Tests 361 passing" — the repo has **1,036 test functions across 110 files** at `df8cfc3`. "Release gate 50/50 golden" — the recorded run holds **52** cases. Both came from a README rather than a count | Counted at HEAD in `citevyn` |
| DEF-32 | Low | **"21 stations" on the SaafSaans plate is repo-stated and not independently verified.** The string appears in `saaf-saans` docs, but the only file referencing `STATIONS` is a test, so it could not be counted. Left on the site as the project's own figure; recorded here rather than silently accepted | Attempted count, 08-08 |
| DEF-33 | Low | **The private plate still draws 3 placeholder rectangles.** Out of scope for the figure work, which covered the four project plates. The critique also reads its two olive slabs as headstones | `.figure rect` count, both viewports |
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
| SaafSaans "started at Build with AI as a three-hour build" | The repo records no duration anywhere. The first commit of the day is "existing UI baseline", and the case study dates the Streamlit app to before 18 July | An owner-stated figure the design doc itself said to label went to the site unlabelled. The rule was written and then not applied in the same change |
| "The certificate is valid and the address resolves" | The address resolves; the server presents no certificate at all | A sentence with two clauses needs two checks. Half a verified claim is an unverified claim |
| A commit message saying "nothing said twice" | Relocation was stated in two places, in two wordings | Claiming an absence needs a search for it, not a memory of intending it |
| `tests/contact.spec.js` "prevents the contact plate being deleted" | Deleting the entire plate passed. So did hiding the whole page | A gate written after its fix has never been observed failing. Watch it fail or it proves nothing |
| "The buildathon's first slot was 16:45, so the 18 July commits precede the event" | **There is no 16:45 slot.** The event ran 09:00–17:30 IST (owner-confirmed, 2026-08-08). The commits at 14:17, 14:49 and 15:21 are *inside* it. I relayed a reviewer's figure into the brief of a six-agent workflow without checking it, and it reached this ledger twice | An unverified figure put into a shared brief is not one error, it is one per agent. Check before you brief |
| The workflow judge's S1: the event page forbids pre-built work | Two fetches of that page returned two different schedules, and neither contained the quoted rules. The finding was never reproducible | The layer built to refute the others needs refuting too. A quote is evidence only if a second fetch returns it |
