# Build plan — step by step, gated

**Nothing in this file is started until the owner approves it.** Work done ahead of approval is
listed under "Already done, out of order" so the record is honest.

Every step carries: the action, who does it, the **gate** that proves it done, and what it
unblocks. A step with no gate is not a step — it is a wish.

---

## Already done, out of order

Done before this plan existed. Recorded rather than hidden.

| What | Gate met | Commit |
|---|---|---|
| `git init` + private remote | `git log` clean, pushed | `4572fc6` |
| Definition-of-Done test suite | Runs; found 14 real violations | `275bbfb` |
| Visual walkthrough, 29 images | Found 2 defects the DOM suite missed | `5e3484c` |
| Playbook language removed | Re-scan returns nothing | `b1c…` |
| 13 skills installed | `skills-lock.json` at 31 entries | `…` |
| DEF-1 fixed — plates paint their own ground | No-JS 1.03:1 → 7.1:1, verified by execution | `…` |
| `docs/STATUS.md`, `docs/learnings/`, `docs/practices/` | Files exist and are indexed | `…` |

---

## Phase 0 — Close the plan before opening the code

| # | Action | Gate |
|---|---|---|
| 0.1 | Owner approves this plan, or marks the steps to change | Written approval |
| 0.2 | `npx skills update`; record versions in `docs/STATUS.md` | Lockfile hashes recorded |
| 0.3 | **End the session.** Skills reload only at session start | New session begins |

**Nothing below starts before 0.3.** A skill installed in this session is not active in it.

---

## Phase 1 — Make the rules bind

Everything written so far is influence. This phase converts it to enforcement.

| # | Action | Gate | Unblocks |
|---|---|---|---|
| 1.1 | `.github/workflows/ci.yml` — build, Definition-of-Done suite, per-plate axe | CI red on a seeded defect, green after revert | 1.2, all of Phase 2 |
| 1.2 | Branch protection on `main`, requiring 1.1 | `gh api …/branches/main/protection` lists the check | Safe merging |
| 1.3 | Tracked `.claude/settings.json` with a `Stop` hook refusing an unverified completion claim | Hook fires; blocked without fresh test output | The rule I break most |
| 1.4 | Visual regression baselines — `toHaveScreenshot`, generated in the CI container | A 12px shift of one element fails the build | Alignment drift |
| 1.5 | Pixel threshold measured, not guessed — 10 unchanged runs, set just above the noise floor | Threshold recorded with its measurement | 1.4 not flaking |

**Exit:** a defect cannot reach `main` without a human overriding a red check.

---

## Phase 2 — Fix what is already known broken

Ordered by severity. Each is a separate branch and PR.

| # | Defect | Action | Gate |
|---|---|---|---|
| 2.1 | DEF-5 — contrast fails on 4 plates, 22 nodes | Re-derive the opacity ramp per ground, not globally | Per-plate axe green on all 7 |
| 2.2 | ~~DEF-2~~ — `?at=` deep links are JS-only | **Fixed 2026-08-10 (pr3-no-js-resilience).** Server-rendering was out of scope (no `functions/` dir, pure `output:'static'`). Every plate already carried a real `id`; `#<plate-id>` resolves natively with no JS. `plates.js` extended to also read `location.hash` so JS-enabled visitors get the same instant jump via `#` that `?at=` gave. AGENTS.md's documented interface corrected from `?at=` to `#id`. | `tests/no-js-nav.spec.js` — `javaScriptEnabled:false`, `/#citevyn` lands the plate, `/?at=citevyn` does not |
| 2.3 | DEF-3 — zero font preloads | `rel="preload"` for the two Latin faces in the LCP path | Preload present; LCP measured before and after |
| 2.4 | 496 KB of PNGs = 60% of the build | Re-encode `og.png` and `paint-grain.png`; consider WebP/AVIF | Build under 400 KB, no visible quality loss |

**Exit:** zero known defects. Every gate green without exception.

---

## Phase 3 — Make the content true

The site currently describes projects from a three-day-old reading.

| # | Action | Owner | Gate |
|---|---|---|---|
| 3.1 | Harvest all six sibling repos into `docs/evidence/projects/` | One read-only agent per repo, parallel | Every claim carries a status label |
| 3.2 | Audit every live site claim against fresh evidence | Claim auditor | Each claim marked true / stale / **false** |
| 3.3 | Rewrite plate content from verified evidence | Author, single writer | No claim above its evidence status |
| 3.4 | Surface the practice findings — 112 skills, the CVE refusal, the ops dashboard | Author | Each traces to a `VERIFIED` line |

**Exit:** nothing on the site is unsupported by `docs/evidence/`.

---

## Phase 4 — Extend the world

| # | Action | Gate |
|---|---|---|
| 4.1 | Long-form mode — same palette and type, without the one-viewport rule | A 2,000-word page renders correctly at both viewports |
| 4.2 | `work`, `writing`, `about`, `contact` pages | Nav stops being same-page anchors |
| 4.3 | Case study per project | Each traces to evidence |
| 4.4 | Interactive résumé — evidence-linked ledger, no skill bars | Every claim links to its proof or is labelled self-reported |

---

## Phase 5 — Brand

| # | Action | Gate |
|---|---|---|
| 5.1 | Produce 4 wordmark directions **without opening the owner's** | Files exist in `candidates/claude/` |
| 5.2 | Owner reveals theirs; both reviewed on the same six constraints | A scored comparison |
| 5.3 | Chosen mark applied to nav, favicon, OG card | Legible at 16px and 1200px, mono, both themes |

---

## Phase 6 — Ship

| # | Action | Gate |
|---|---|---|
| 6.1 | Cloudflare Pages, apex + `www` | `curl -I stackclimb.com` returns 200 |
| 6.2 | Proxy app subdomains through Cloudflare, Full (Strict) | Origin IPs no longer public |
| 6.3 | Verify by the deploy **job**, not a health check | Job ran, not skipped; build SHA matches merged SHA |

---

## Phase 7 — Maintain

| # | Action | Gate |
|---|---|---|
| 7.1 | Weekly harvest + claim audit, scheduled | A drift issue, or silence |
| 7.2 | Memory consolidation — enable auto-dream, `git init` the memory dir | History exists; prune becomes reversible |
| 7.3 | NarraTwin avatar as the site's representative | **IN PROGRESS, tied to Cut 1 (D97).** Every reading verified blocked: production No-Go, no owner-avatar asset exists (deliberately out of scope per NarraTwin's own ADR-0054), and the fallback (Meera) is blocked by that repo's own `publication_allowed: false`. Register only — no site change; existing NarraTwin page and overview already disclose this honestly |

---

## Corrective actions carried from `docs/learnings/`

Each is a change to how work is done, not a task to finish.

| From | Corrective action |
|---|---|
| L-PLAN-1 | Check `git rev-parse --abbrev-ref HEAD` before drawing a conclusion from any repo |
| L-PLAN-2 | State the file a claim came from, in the claim |
| L-PLAN-3 | Grep before stating the size of a change |
| L-DESIGN-1 | Check relative values against the lightest and darkest surface they can land on |
| L-DEV-1 | Test both JS states for anything that establishes meaning |
| L-TEST-2 | Reproduce the user's state before scanning |
| L-REV-1 | Test the artifact that ships, not the source that builds it |
| L-REV-2 | Ask what a second lens can see that the first structurally cannot |

---

## What this plan does not cover

Named so the gaps are visible, not discovered later.

- **Writing content.** No articles exist. Phase 4.2 builds the section; it does not fill it.
- **A résumé document.** Undecided whether one is downloadable.
- **Contact beyond `mailto:`.** No form, no scheduling link.
- **Grounding answers in fetched documentation.** No public skill covers it, and the avatar
  needs it. Unsolved.
