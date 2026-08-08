# Action plan — from here to a site that closes in 30 seconds

Written 2026-08-08. **Index, not a restatement.** Detail lives in `docs/STATUS.md` (the ledger),
`docs/positioning-decisions.md` (today's copy decisions), and
`.impeccable/critique/2026-08-07T21-01-10Z__src-pages-index-astro.md` (the scored review).

**The acceptance test for all of it, in the owner's words:** *within 30–60 seconds a recruiter or
hiring manager should feel "I should call this person."* Not a heuristic score.

**Current state:** live at `stackclimb.com`, `main` level with `origin/main`, 18 tests green,
contrast gate green, worst plate seam 7.56:1. Critique scored **21/32**; roughly two thirds of
its findings are still open.

---

## Phase 0 — decide the words before drawing anything

Building a hero around an unsettled headline is rework. This phase writes no CSS.

| # | Item | Source |
|---|---|---|
| 0.1 | Install `brand-positioning`, `brand-messaging`, `brand-story`, `brand-voice` from `arnabbagxd/Brand-building-skills` (MIT, 481★). **Then end the session** — skills load at start | O-SKILLGAP |
| 0.2 | Run `brand-positioning` + `grilling` against the four systems and the FDE/AI-platform target roles | D23 |
| 0.3 | Settle the headline. Decided direction: the full line, *"AI systems that show their work and refuse to fake it"* | D23 |
| 0.4 | Settle the contact line. Direction: reader's-problem framing, per the amended voice rule | D24 |
| 0.5 | Cut `Seeking` from five job titles to one. Five reads as "does not know what he wants" | O-30SEC |
| 0.6 | Write the plain-words hero sentence that replaces "shift-left / shift-right" | D26 |

**Gate:** copy is written down and agreed before Phase 1 starts.

---

## Phase 1 — the 30-second page

The single largest gap. Nothing below is cosmetic.

| # | Item | Why |
|---|---|---|
| 1.1 | **Overview / contact-sheet plate directly after the hero.** One row per system: what it does, what a user gets, its state, one hard number | O-OVERVIEW · D1 (07 Aug, unexecuted) |
| 1.2 | **Resolve the hero refusal card.** It can be read as evidence *against* him — see O-HERO. Recommended: move it to the CiteVyn plate, give the hero the overview | O-HERO |
| 1.3 | **Name at display size.** Currently 18.24px against a 96px headline | O-30SEC |
| 1.4 | **Add a CV/résumé link.** Verified absent — zero matches on the page | O-30SEC |
| 1.5 | Apply the Phase 0 copy | D23 · D24 · D26 |

**Gate:** a reader who has never met him can say what he does, what he built, and how to reach
him, without scrolling past the second screen.

---

## Phase 2 — make it feel alive

Owner reiterated this twice and named it as a maturity gap: *"the hero card is not interactive…
there are no animations and interactions so the user can feel it."*

| # | Item | Measured today |
|---|---|---|
| 2.1 | Scroll-linked entry per plate, ~60ms stagger, gated on the existing `prefers-reduced-motion` block | **0 keyframes, 0 animated elements** |
| 2.2 | Make the record cards respond — hover/focus state, pointer-reactive light | Cards are inert |
| 2.3 | Fix the leader line: it draws a raw diagonal straight through the artwork | Critique P1 |
| 2.4 | `.site-nav .brand` has no hover style — the only interactive element without one | Critique, minor |

Use `improve-animations` (emilkowalski — author of Sonner and Vaul). **One builder, not a fan:**
parallel writers share one working tree.

**Gate:** every animation interruptible, `prefers-reduced-motion` honoured, no CLS regression,
Lighthouse ≥ 94 mobile.

---

## Phase 3 — the Engineering Operating Model page

The strongest answer to *"is the AI move real, or four weekend projects?"*

| # | Item | Note |
|---|---|---|
| 3.1 | **Verify the diagram exists** — `imrohitagrawal/assets/engineering-lifecycle-*.svg`. This is a `PRODUCT.md` claim; nobody has opened the file | D25 |
| 3.2 | Build the page around it: discovery → design → assure → run, with trust/provenance/evaluation across every stage | D25 |
| 3.3 | Employment evidence, **labelled self-reported**: Oracle MTTD −35%, cycle time −25% | D25 |
| 3.4 | "Shift-left by default, shift-right by design" appears here in full, where context defends it | D26 |
| 3.5 | **Photo goes here, not the hero** — reasoning in `docs/positioning-decisions.md` | new |

---

## Phase 4 — the critique's remaining findings

Roughly sixteen items, still open. Full text in the critique snapshot.

**Composition (P1)** — plate heights 900–1091px in a 900px viewport, violating `DESIGN.md:191`'s
own one-plate-one-viewport rule · contact plate has **no figure and 86.6% empty ground**, so the
page ends by going blank · mobile page is 10,305px.

**Content and copy** — SaafSaans puts 19 lines of paragraph before its first link · interactive
caption cells look identical to dead ones · colophon is 123 characters of all-caps at 10.56px ·
`Quorum‑AI` uses a non-breaking hyphen in the h2 and a plain one in the nav · the `stackclimb`
wordmark is `display: none` below 900px, so mobile has no domain identity.

**Assets and routing** — `paint-grain.png` is 166KB, **63% of total page weight** · every URL
returns the home page with HTTP 200: no robots.txt, no sitemap, no 404 (#16) · `AEGIS-CONTRACTS`
tag has zero side padding while `EVALAXIS` beside it has generous padding.

**Recorded, not fixed** — DEF-32 ("21 stations" is repo-stated and could not be counted) ·
DEF-33 (the private plate still draws 3 placeholder rectangles, and reads as headstones).

---

## Phase 5 — the standing debt

Untouched since it was written. `AGENTS.md` says to say this out loud at the start of any
deployment work, and it has not been said.

| Exit condition for approach C | Status |
|---|---|
| The 7 tests that cannot fail are repaired (DEF-11 … DEF-17) | **open** |
| The suite builds before it tests (DEF-11) | **open** |
| Contrast passes on all 7 plates, both viewports | **done 08-08** |
| CI workflow exists and has been green at least once | **open** |
| Branch protection requires that check | **open** (needs the repo public, or Pro) |

Plus: secrets gate (gitleaks, `fetch-depth: 0`) · tracked `.claude/settings.json` · gitignore the
434 vendored skill files before publishing · #9 wordmark (owner protocol: options produced before
his candidates folder is opened) · #10 RCA for the skipped render check.

---

## How this gets built

- **One work package, one PR, merged before the next starts.** Six packages went onto one branch
  today with zero PRs. That does not repeat.
- **Builds are serial, reviews fan out.** Subagents share one working tree.
- **Review capped at two rounds** (D9), with the circuit breaker. At least one reviewer from a
  different model family — measured here on 07 Aug, Codex found five holes two same-model
  reviewers missed.
- **Every claim on the site traces to a named file at a named commit,** or it does not ship.
- Screenshot desktop and mobile and **look at them** before reporting anything as done.
