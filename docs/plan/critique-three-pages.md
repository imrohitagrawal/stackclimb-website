# /experience, /how-i-build, /cv — the first critique, and the plan it produced

`$impeccable critique` run on 2026-08-28 against all three routes. **These three pages had never
been critiqued.** `.impeccable/critique/` held five snapshots before this run and every one of
them was `/` or the layout. None of the three has a surface brief. That is the root cause of most
of what follows: the pages were built to a documented design system and then never measured
against it.

Method: dual-agent, five isolated read-only subagents (3 × design review, 1 × detector and browser
evidence, 1 × content and evidence integrity). Every finding repeated here was independently
re-verified by command before it was written down. Nothing was executed against the repo.

Scores, with the home page's last run for calibration:

| Route | Score | Band |
|---|---|---|
| `/` (2026-08-23, prior run) | 22/32 | Acceptable, 69% |
| `/cv` | **24/40** | Acceptable, 60% |
| `/experience` | **23/40** | Poor–Acceptable, 58% |
| `/how-i-build` | **16/28** (7, 9, 10 n/a) | Acceptable, 57% |

Snapshots: `.impeccable/critique/2026-08-27T19-35-09Z__src-pages-{cv,experience,how-i-build}-astro.md`

## Ground truth, verified by command

| Fact | Command | Result |
|---|---|---|
| `one-col` grid dead on 2 pages | `getComputedStyle` on `.plate-grid` at 1440 | `551.672px 499.125px`; copy 544px in a 1123px frame — **48% fill on all 5 plates** |
| Same class works on project pages | same, `/projects/citevyn` | `1122.81px` — the rule ships inline there |
| Why | `grep -rn one-col src/styles/` | defined only in `project.css`, which neither page imports |
| Baseline froze the bug | `geometry-baseline.darwin.json` | `row.evolution-record/ctas#0.box` width **544** — the gate certifies the defect |
| CV print loses its best section | `page.pdf` at Chrome's real margins, pdfjs extract | `Delhi-NCR`, `Evidence`, `citevyn.stackclimb.com`, `GATE` label all **absent**; `stackclimb` 0 hits |
| Printed page 1 mostly blank | same, ink extent on page 1 | **38% fill** at 0.4in margins; 78% at Playwright's defaults, which is what the gate uses |
| Why the details vanish | `getComputedStyle` under print media | Chrome hides closed `<details>` via `content-visibility` on `::details-content`; `cv-print.css:77` overrides `display` |
| Why page 1 is blank | same | `.cv` computes `padding-top: 88px`, `min-height: 720px`, `display: grid` — `global.css:84` beats `cv-print.css:55` on source order |
| Both fixes proven | injected CSS, PDF regenerated | details restored **and** page-1 fill 38% → **78%** |
| Artefact quote is not verbatim | `sed -n '1,14p'` on the real workflow | two non-adjacent lines fused; 12 words dropped with no ellipsis |
| Skill count stale | `ls -d ~/Projects/quorum-ai/.agents/skills/*/ \| wc -l` | **113**, page says 112 — stale since `project-faq`, 2026-08-12 |
| OTel/Prometheus count | `git grep -l opentelemetry` across the repos | **two** systems, not three; saaf-saans uses Elasticsearch/Kibana |
| Narrow-viewport overflow | `scrollWidth` vs `innerWidth` | `/how-i-build` **383 vs 320 and vs 360**; 390 clean, which is why the gate never saw it |
| Cause | mutation in page | `.plate-figure` has `min-width: 0` (`global.css:219`), `.plate-copy` does not |
| Grounds undeclared | `getComputedStyle` `--ground` per plate | 3 of 5 plates fall back to base `#0e1322`; two of them **adjacent**, distance 0.0 |
| Ochre overloaded | computed colour census, `/cv` | **36 elements, six meanings**; 6 employer names look like the 11 links and are not links |
| `og.png` advertises a deleted element | read the image; `grep -ro "Plate N" dist/` | card renders `PLATE Nº 00 — THE RECORD`; site has **0** occurrences |
| Accessibility | axe-core, both viewports, all three routes | **0 violations**; contrast 0 failures; focus order clean; min type 11px |
| Performance | `curl -w` against production | TTFB 0.19–0.27s, one 25KB CSS bundle — **nothing to fix** |

Two checks that changed a conclusion, recorded because the method matters more than the result:

- The second `/experience` plate renders blank in a Playwright `fullPage` capture. It is **not** a
  defect — scrolled into a real viewport it reports `opacity: 1` with both CTAs painted.
- A first PDF probe reported the `Gate` label PRESENT. It matched `gates` in the summary
  paragraph. **Substring, not token** — the same trap `docs/evidence/README.md` already records.
  Re-checked as a token: the label is absent, and returns once the details fix is applied.
- `docs/brand/README.md:65` says `og.png` "shows the old palette and, almost certainly, the deleted
  mannequin". **Refuted by looking at the image** — it shows the current value ladder, the lit
  REFUSED panel and the real photo. The conclusion (stale) is right; the stated reason is wrong and
  is corrected in P6 rather than deleted.

## The owner's questions, answered

| Question | Answer |
|---|---|
| Colour change? | **No new palette. Apply the one that exists.** 3 of 5 plates declare no ground; ochre carries six meanings on `/cv` |
| Layout change? | **Yes — the largest single win.** 48% grid fill from two dead classes |
| Format change? | **Yes, `/cv` output only.** PDF, print and clipboard all drop the same section |
| Theme change? | **No.** See the light/dark record below |
| Redesign? | **No.** Portrait Plates is under-applied, not failing. Replacing it would discard the rules whose absence caused these defects |
| Routine pass? | **Yes, overdue.** First critique these routes have ever had |

## Light and dark theme — D30 stands, with one argument added

**D30 (2026-08-09) deferred light/dark, did not reject it**, and priced it: seven grounds and seven
surfaces re-derived, the value ladder rebuilt, ~14 contrast pairs re-checked, and `data-theme`
already taken by plate theming.

The argument D30 does not make, and which is stronger than cost: **the Value Ladder is built on
darkness.** `--lit` at L96% is *the light source* — one near-white surface per system, holding a
real artefact, glowing against a dark ground. On a light ground there is no light source. The
Lit-Surface Rule is the site's signature device and every artefact panel depends on it; a light
theme would not port that rule, it would leave it meaningless. The owner's own value-ladder RCA
points the same way: the fix for "dark and dull" was more value range *within* dark.

The site also already has a light rendering exactly where one is needed — `/cv`'s print stylesheet
is ink on white, contrast-checked, tracking reset, hrefs verbatim.

**D30's self-criticism still stands and is not papered over:** the site honours
`prefers-reduced-motion` and ignores `prefers-color-scheme` — verified, zero occurrences in `src/`,
`data-theme="dark"` hardcoded at `Layout.astro:104`. Respecting one stated user preference while
ignoring another is the weakest part of the position.

**Recommendation: do not build it, and do not half-build it.** A single light page would be a worse
inconsistency than a consistent dark site. If the gap is to be closed, close it by naming the
position in `DESIGN.md` with D30's counter-argument attached, not by shipping a partial theme.
**Open decision, owner's call — recorded here rather than settled.**

## The plan — six packages

One work package, one pull request, merged before the next starts. RCA written and approved before
each begins, per AGENTS.md's document-before-changing rule.

### P1 — `/cv` output integrity · `harden` + `clarify`

The highest-value package: it is the only one that changes the artefact a hiring manager holds.

- `.cv-proj:not([open])::details-content { content-visibility: visible !important }` in
  `cv-print.css`, keeping the existing `display` rule for other engines
- `.cv.plate { padding: 0 !important; min-height: 0; display: block }` — raise specificity rather
  than fight source order
- `copy.querySelectorAll('details').forEach((d) => { d.open = true; })` in `copy-cv.js`
- The colophon's "and marked approximate" tail, which contradicts P-25 on the one page gated to
  not carry it; and `/experience`'s matching promise, "every approximate figure marked as such"
- **The gate**: extend `pdf-text.spec.js` to assert *presence* — `Delhi-NCR`,
  `citevyn.stackclimb.com`, the `GATE` label — and a page-1 fill floor, **printing at Chrome's real
  margins, not Playwright's defaults**

Why nothing caught it: `pdf-text.spec.js` anchors on `Rohit Agrawal`, `Oracle`, `Bengaluru`, all
outside the `<details>`, and prints at default margins. It proves the text is well-formed. Nothing
proved it was complete.

### P2 — `/how-i-build` evidence fidelity · `clarify`

- Requote the artefact **verbatim**, expanded to carry what the current edit dropped: *"This is a
  PROXY: it cannot see a Deploy run that reported success while production did not actually roll"*
  and *"on 2026-08-07 that left production 34m31s behind while every passive probe stayed green"*.
  The source is both more correct and more persuasive than the paraphrase
- Link the footer to the file at a pinned SHA. **Constraint: ochre on `--lit` is 2.22:1** — the link
  must be `--ink` with an underline
- `112` → `113`; "across three systems" → two; `.github` is not a skill; CiteVyn's state drift
  (`Live` on `/cv`, `Live — cold-starts` on `/` and `/projects/citevyn`)
- **The gate**: bind the *digits*, not just the phrase, and diff the panel against the real
  workflow file rather than against `failure-driven.md`

### P3 — the dead column · `layout` + `adapt`

- Restore `one-col` / `wide` for both pages
- `min-width: 0` on `.plate-copy` — fixes the 320/360 overflow
- Split `.era-org` so role and dates stop sharing one `<p>` under `global.css:171`'s 52ch cap,
  which is what orphans "September 2015" and "2026"
- **Requires a runner-side geometry baseline regeneration.** The baseline recorded the defective
  544px width, so the fix turns the gate red, and DEF-59's guard refuses a laptop

Composition of the freed space is deliberately **not** in this package. Restoring the rules puts the
headline on one line and closes the 690px inter-plate void, but the right ~45% stays empty because
`global.css:171` caps the measure at 52ch. That is a separate decision — P5.

### P4 — livery and hierarchy · `colorize` + `typeset`

- Give every plate a ground. `palette.css` hues only the first plate of each page
- Reduce ochre's six roles on `/cv`
- Re-grammar `band-term`: seven bold spans exist so `how-i-build.spec.js` can bind each claim to a
  `VERIFIED` evidence line, and the reader is given no key. One — "the incident that caused it" —
  sits in `band-lead` at 600 against 700 and is invisible. Make the evidence-binding visible
- `flat-type-hierarchy`: 7 of 8 rendered sizes sit inside 11–16px

### P5 — composition, and the missing surface briefs · `shape`, then `bolder` or `distill`

**Needs the owner's input, not just approval.**

- Write the three surface briefs. Their absence is why the mode was never pinned
- Hoist the artefact above the claim bands on `/how-i-build` — measured bottom at 772px (1440×768),
  759px (1280×720), 927px (390×844); fully visible only above a 900px viewport height, and it
  arrives fourth
- Lift `/experience`'s closing sentence above the era list at mobile: plate 1 is 1075px in an 844px
  viewport, so the argument falls below the fold
- Decide whether `/cv`'s Independent Systems stays a disclosure at all

### P6 — `og.png` and the home page · `critique` on `/` first

- Regenerate the share card without the deleted `Plate Nº`; correct `brand/README.md:65`'s refuted
  reason in place, since corrections stay
- Re-critique `/` before touching it. Its last run was 22/32 with 1 P0 and 2 P1s outstanding;
  inheriting a stale snapshot would plan against a page that has moved

## Commands deliberately not proposed

`optimize` and `core-web-vitals` — performance is measured and fine. `animate` — motion exists,
works, and has a persisted toggle. `onboard` — no first-run flow. `overdrive` / `delight` — would
fight the register. `quieter` — already quiet, arguably too quiet. `extract` — tokens are already in
`DESIGN.md`. `init` — `PRODUCT.md` is current. `live` — needs a browser session; the static route is
cheaper. `document` — `DESIGN.md` has drift, but regenerating it while six packages change the code
guarantees it is stale again. Run it **after** P5.

The 30.8KB PNG wordmark is **not** a finding: `docs/brand/README.md:29` records it as the owner's
real image asset, not retyped text. Checked before proposing anything.

## Skills the packages depend on

| Skill | Why it is required, not optional |
|---|---|
| `work-package-protocol` | The owner asked for planned and reviewed work; this is that protocol |
| `codex:adversarial-review` | Every package changes a gate. AGENTS.md requires two adversarial reviewers on any test change, **at least one from a different model family**. A subagent of this session is context isolation, not model decorrelation |
| `test-driven-development` | All three defects passed a green suite. A gate that has never been red proves nothing |
| `visual-review` | Definition-of-Done item 2 — seen rendering, desktop and mobile |
| `doc-critic` | Each package owes a `STATUS.md` row and, for P1/P2, an RCA |

## Constraints

1. **Skills currency is a planning-phase gate** and skills load at session start. If
   `npx skills update` moves a hash, implementation begins in a new session.
2. **P3 cannot be verified locally** — the geometry baseline regenerates on a runner only.
3. Every package owes a `docs/STATUS.md` row in the same change.
4. Start with **P1** if only one package is taken: both fixes are already proven by execution, it
   is the smallest diff of the six, and it is the only one that changes what a recruiter receives.
