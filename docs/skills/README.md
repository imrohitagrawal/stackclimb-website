# Skill routing — which skill owns which stage

One driver per stage. Reviewers critique and request changes; they never write. Precedence
when two skills conflict: user's explicit instruction → `AGENTS.md` → the driver skill →
reviewer findings.

## The rule that governs this table: the builder is never the auditor

**A skill that produced the work may not be the skill that judges it.** `impeccable` drives the
design *and* ships `critique` and `audit`. Using its own audit on its own output is a skill
grading its own homework — it applies the same heuristics that produced the design, so it
agrees by construction and its blind spots are exactly the ones it built in.

Every build stage therefore carries a reviewer from a **different lineage**:

| Built by | Must be reviewed by | Why the lens is genuinely different |
|---|---|---|
| `impeccable` (layout, hierarchy, visual world) | **`ui-ux-pro-max`** | Different heuristic set — its own palette, typography, spacing, and interaction-state systems, authored independently |
| `impeccable` (structure, abstractions) | `taste-check` | Torvalds' good-taste lens: special cases, nesting depth. Orthogonal to anything visual |
| Any motion work | `review-animations` | Emil Kowalski's craft bar, not impeccable's |
| Anything rendered | **the pixel reviewer** (`visual-review.md`) | Judges images only. Cannot inherit an assumption it never read |

`impeccable audit` is still run — it catches a11y, performance, and responsive issues cheaply —
but it is a **self-check, not the review**. It never satisfies the review requirement alone.

Adapted from NarraTwin's `docs/SKILL_EXECUTION_PLAN.md` and `docs/SKILL_LOCK.md`.

## The route

| Stage | Driver (writes) | Reviewers (read-only) |
|---|---|---|
| 1. Product truth | `impeccable init` | — |
| 2. Surface brief | `impeccable shape` | — |
| 3. Direction exploration | `prototype` | `design-taste-frontend`, `high-end-visual-design` |
| 4. Visual world + DESIGN.md | `impeccable` (new-work) | `taste-check` |
| 5. Brand / wordmark | `brandkit` | `high-end-visual-design` |
| 6. Build | `impeccable` (craft-floor) | `emil-design-eng` |
| 7. Motion | `find-animation-opportunities` → implement | `review-animations` |
| 8. Review | — | **`ui-ux-pro-max`**, `taste-check`, `review-animations` |
| 9. Visual verification | — | the pixel reviewer (`visual-review.md`) |

`impeccable critique` and `impeccable audit` run at stage 8 as a **self-check** — cheap, useful,
and not a substitute for an independent lens. See the builder-is-never-the-auditor rule above.

## Stage notes

**1–2. Requirements.** `impeccable init` owns `PRODUCT.md`; `impeccable shape` owns the surface
brief and stops before code. No PM skill is installed here — NarraTwin locks
`github.com/phuryn/pm-skills` for exactly this, and it is a candidate if requirements work grows
beyond one person's site.

**3. Direction exploration — use `prototype`, not hand-rolled pages.** It builds multiple
genuinely different versions of a UI piece, rendered. The three directions built earlier in this
project were hand-authored; `prototype` is the right tool and would have been faster.
`ui-ux-pro-max` is the reference library behind it — 50+ styles, 161 palettes, 57 font pairings.

**4. Visual world.** `impeccable` routes; `taste-check` (Linus Torvalds' "good taste": kill
special cases, flatten nesting) reviews the result. Style-specific skills — `minimalist-ui`,
`industrial-brutalist-ui`, `stitch-design-taste` — load **only** if that direction is chosen.
Loading them speculatively drags the design toward their house style.

**5. Brand.** `brandkit` generates mark and identity boards. Blocked until the visual direction
is settled — see `docs/brand/README.md`.

**6. Build.** `impeccable`'s craft-floor carries the quality floor and absolute bans; load it
immediately before editing UI, never for planning. `emil-design-eng` reviews component and
polish decisions. `pick-ui-library` applies only if a library is proposed — the current site
ships 2,289 bytes of inline JS and no framework, so the bar for adding one is high.

**7. Motion.** `find-animation-opportunities` proposes with exact values and is read-only;
`animation-vocabulary` names an effect precisely; `review-animations` judges against Emil
Kowalski's bar. Motion is the answer to "the page feels dull" only after the still frame is right.

**8. Review.** Sized to blast radius per `AGENTS.md`. Two adversarial reviewers on any test
change, always.

## Skills deliberately NOT routed

Named so nobody wonders whether they were forgotten.

| Skill | Why not |
|---|---|
| `gpt-taste` | Mandates GSAP ScrollTriggers, bento grids, and a fixed page structure. Conflicts with the committed plate world. |
| `imagegen-frontend-mobile` | No mobile app here. |
| `image-to-code` | Codex-targeted, and we implement from a committed design system, not from generated images. |
| `redesign-existing-projects` | Reserved. Applies only if the plate world is abandoned, which is not the current plan. |
| `full-output-enforcement` | Load only when a long file is being written and truncation is a live risk. |

## The gap: visual verification

**No installed skill verifies what a user actually sees.** Every skill above reasons about
source, and the current test suite asserts DOM and computed styles. Both can pass while the
rendered page is wrong.

This project's own evidence for why that matters: the `#private` plate passes every DOM
assertion and is **invisible without JavaScript** — ink text on an ink-navy ground, contrast
1.03:1. A DOM test sees the right colour token. A screenshot sees an empty page.

The rule this project adopts, from `quorum-ai/docs/DAY-ONE-PROMPT.md`:

> "Rendered pixels + real behavior are the source of truth — never DOM assertions or mocked
> JSON alone." · "A disclosure you have not seen rendered is not a disclosure."

**Requirement.** One reviewer walks the page the way a visitor does — load, scroll each plate,
hover a caption, tab through focus, resize to mobile, disable JS, disable motion — capturing an
image at every step, and judges **only the images**. It is forbidden from reading the DOM, the
CSS, or the source. Its report says what it *saw*.

Harness at `tests/visual-walkthrough.mjs`, reviewer contract at `docs/skills/visual-review.md`.
Neither exists yet; this is the next thing to build.
