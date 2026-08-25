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
| `impeccable` (layout, hierarchy, visual world) | **`design-review` agent** (from the ui-ux-pro-max repo) | Different **method** and an **unconstrained remedy space** — see the correction below |
| `impeccable` (structure, abstractions) | `taste-check` | Torvalds' good-taste lens: special cases, nesting depth. Orthogonal to anything visual |
| Any motion work | `review-animations` | Emil Kowalski's craft bar, not impeccable's |
| Anything rendered | **the pixel reviewer** (`visual-review.md`) | Judges images only. Cannot inherit an assumption it never read |

`impeccable audit` is still run — it catches a11y, performance, and responsive issues cheaply —
but it is a **self-check, not the review**. It never satisfies the review requirement alone.

### Correction: a second lens reciting the same standard is not a second opinion

An earlier version of this file justified `ui-ux-pro-max` as the review lens because it has
"its own heuristics, authored independently." **That was wrong**, and the way it was wrong is
worth keeping.

Of 208 rules in its quick reference, **115 cite Apple HIG, Material Design, WCAG, or Core Web
Vitals** — the same standards `impeccable/reference/audit.md` checks against. On contrast, touch
targets, focus visibility, alt text, heading order, and reduced motion the two **agree by
construction**, because both are restatements of WCAG 2.1 AA. Independently *compiled* is not
independently *derived*. That is a second printing, not a second opinion.

Two further corrections from the same review:

1. **`impeccable critique` already isolates its sub-agents** — "Assessment A and B MUST run as
   two isolated sub-agents… They must not see each other's output," with a `⚠️ DEGRADED` banner
   otherwise. The bias was never sloppy isolation.
2. **The skill has no review mode at all.** It is generative — its mandatory workflow is
   "Generate Design System (REQUIRED)". Handing it a built page yields a list of rules, not a
   judgement.

**Where the independence is real**, and why a second lens still belongs:

- **Method.** `impeccable audit` opens: *"This is a code-level audit, not a design critique."*
  The `design-review` agent is the inverse: *"You do not guess from the code; you open the page
  in a real browser and observe it… Read code only to explain a defect you already observed."*
  Same rules, different evidence, so they fail differently.
- **Remedy space — the structural argument.** `audit.md` constrains itself: *"Only recommend
  commands from: /impeccable adapt, /impeccable animate, …"* Its review can only ever prescribe
  more impeccable. **A problem outside its command set is a problem it cannot name.**

So the reviewer is the `design-review` agent (MIT, adapted) — not the skill. The skill stays
where it belongs, as the stage-3 reference library.

**Also:** the installed plugin is v2.5.0 and declares *"Stack: React Native (this project's only
tech stack)"*. Upstream v2.14.1 supports 22 stacks including Astro. Upgrade before relying on it
for anything.

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

## How the two skill trees relate — read this before filing a drift defect

`.agents/skills/` is canonical. `.claude/skills/` mirrors it with symlinks — 53 of its 56
entries are symlinks pointing at `../../.agents/skills/<name>`.

**The exception, and it is deliberate: a skill that needs Claude-specific frontmatter or a
Claude-specific body ships as a real directory, not a symlink.** A symlink can only serve one
file to both runtimes, so a skill whose `SKILL.md` must differ cannot be one.

Three directories under `.claude/skills/` are real:

| Directory | Files | `.agents/` counterpart | Why it is real |
|---|---|---|---|
| `impeccable` | 148 | yes (153 files) | It is the **only** skill here with `user-invocable: true`, and it also carries `argument-hint`, `license`, and `allowed-tools` scoped to `Bash(node .claude/skills/impeccable/scripts/*)`. The `.agents/` copy has none of the four. Symlinking would strip them and `/impeccable` would stop being a slash command |
| `architecture-and-decisions` | 16 | **none** | Nothing to symlink to |
| `doc-critic` | 14 | **none** | Nothing to symlink to |

**So the two `impeccable` trees differing is the design, not a defect.** `diff -rq` reports 34
lines between them; 31 of the 33 differing files differ **only** by which runtime they target —
`/impeccable` against `$impeccable`, the two script roots, `CLAUDE.md` against `AGENTS.md`, the
ask-the-user tool, and Codex-only blocks (a `spawn_agent` sub-agent gate, Run Notes) that Claude
Code has no use for. The `.agents/` tree also ships an `agents/` directory of Codex sub-agent
definitions that has no meaning here — which is why it holds 153 files against 148.

This was filed once as DEF-61 ("decide which tree is canonical") and refuted in D123. Do not
refile it, and do not collapse the trees — the rejected-options table in `docs/STATUS.md` carries
the four things that breaks.

### Where these three came from

All three are **unlocked** — absent from `skills-lock.json`, no `computedHash`, so `npx skills
update` cannot currency-check them. AGENTS.md requires an unlocked skill carry its source and
install date. Both, for all three, live in the skill-currency section of `docs/STATUS.md`; the
short version:

| Directory | Source | Installed | How |
|---|---|---|---|
| `impeccable` | `github.com/pbakaus/impeccable` — public, third-party | 2026-08-07, `93e4bae` (repo creation) | `/plugin marketplace add pbakaus/impeccable`, then `npx impeccable install`, then `/impeccable init`. The first and third are Claude Code slash commands, not shell |
| `architecture-and-decisions` | `github.com/imrohitagrawal/project-doc-skills` — public, **first-party** | 2026-08-07, `6633480` | From `dist/*.skill`, never by copying `skills/<name>/` (D12 trap 2) |
| `doc-critic` | the same repo | 2026-08-07, `6633480` | the same bundle route |

Two things not to trip over. `npm view impeccable version` says **3.6.0** — that is the CLI
installer; the skill content declares **4.1.1**. Two artifacts, two numbers, neither corrects the
other. And the two doc skills are the owner's own work, so they are evidence of practice rather
than third-party authority under AGENTS.md's provenance rule.

The 2 files that carry drift harness targeting does not explain were filed as DEF-66, and
**DEF-66 is now closed as upstream behaviour, not a defect of ours** (D127, 2026-08-25). The
re-fetch ran — `npx impeccable install` — and did not touch either file. The same two files
pulled straight from `pbakaus/impeccable` on GitHub hash identical to the local ones, and
upstream's own `.agents/` and `.claude/` copies carry the same asymmetry: `reference/craft-floor.md`
is 50 lines against 44, `reference/new-work.md` 120 against 122. So the five craft bullets really
are `.agents/`-only and the "measured rendition prior" paragraph really is `.claude/`-only —
upstream packages them that way.

**Do not hand-merge the six lines.** `impeccable` is vendored third-party work; hand-editing it
forks it and destroys the provenance that makes it authority. If the asymmetry is worth fixing,
it is an issue to raise upstream against `pbakaus/impeccable`, not a local patch.

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
