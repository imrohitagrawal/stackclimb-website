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
| 1.6 | **Avatar beside his name in the lede.** Owner's decision 09 Aug: avatar-sized is fine, it need not read as a portrait. The only placement that fits — the hero is already 191px over a 900px viewport | D27 |
| 1.7 | **Rebuild the nav: `WORK · APPROACH · CONTACT · Email me`.** "Private" leaves the menu; the private work becomes a row on the overview with `closed` as its state | D28 |

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
and **Lighthouse mobile no worse than 98** — the current measured value. An earlier draft of this
plan set the gate at 94, which would have silently authorised a four-point regression on the
site's strongest measured property. Caught in adversarial review, not by me.

**Rule conflict, resolved 09 Aug.** `docs/STATUS.md` says in bold *"Do not 'optimise' scroll,
animation, or the blend overlay."* Owner confirmed that means do not micro-tune an already-fast
site; it does not forbid adding purposeful motion, which he has now asked for twice.

---

## Phase 3 — the Engineering Operating Model page

The strongest answer to *"is the AI move real, or four weekend projects?"*

| # | Item | Note |
|---|---|---|
| 3.1 | **Verify the diagram exists** — `imrohitagrawal/assets/engineering-lifecycle-*.svg`. This is a `PRODUCT.md` claim; nobody has opened the file | D25 |
| 3.2 | Build the page around it: discovery → design → assure → run, with trust/provenance/evaluation across every stage | D25 |
| 3.3 | Employment evidence, **labelled self-reported**: Oracle MTTD −35%, cycle time −25% | D25 |
| 3.4 | "Shift-left by default, shift-right by design" appears here in full, where context defends it | D26 |
| 3.5 | A second, larger portrait may sit beside the diagram here — optional. **The primary photo is in the hero**, owner's decision 09 Aug | D27 |

---

## Phase 4 — the critique's remaining findings

**Thirteen items listed below, of which eleven are actionable** — the other two are recorded-not-fixed. An earlier draft claimed "roughly sixteen"; the count was inflated by about 45% and corrected in adversarial review. Full text in the critique snapshot.

**Composition (P1)** — plate heights 900–1091px in a 900px viewport, violating `DESIGN.md:199`'s
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

## Phase 4b — findings scheduled nowhere until 09 Aug

Four HIGH defects sat in `docs/STATUS.md` and in no phase. Found by adversarial review.

| # | Item | Verified |
|---|---|---|
| 4b.1 | **DEF-7 — the SaafSaans link is dead and still on the page.** `curl` returns `000` after 20s; `index.astro:196` still links it. **Highest-cost item on the site**: the one click that tests the thesis returns nothing | 09 Aug |
| 4b.2 | **DEF-27 has regressed.** The ledger says FIXED; `index.astro:48` and `:368` both state relocation again. Re-introduced by me in `e54ebd5` | 09 Aug |
| 4b.3 | DEF-6 — the DEF-1 fix fails open when the module dies | `STATUS.md:137` |
| 4b.4 | DEF-19 — CSP fails silently and the bad case is the default | `STATUS.md:150` |
| 4b.5 | DEF-22 — render-blocking CSS; mobile LCP 2.4s → 1.4s | `STATUS.md:152` |
| 4b.6 | **Re-verify every FIXED row in the ledger before trusting Phase 4.** DEF-27 already failed that check | — |

Also dropped from Phase 4 and now restored: the four lowest-scoring heuristics — nav marks no
active plate (H1, 2/4), compressed cell labels (H6, 2/4), nav reaches 3 of 7 plates (H7, 2/4),
and unskippable smooth scroll over 6,638px (H3).

---

## Phase 6 — deferred, with reasons, so they do not come back

| Item | Decision |
|---|---|
| **Light and dark theme** | **Deferred 09 Aug, not rejected.** Owner: do the agreed work first. Cost is high — seven grounds and seven surfaces re-derived, the value ladder rebuilt, ~14 contrast pairs re-checked, and `data-theme` is already used for plate theming. It moves the 30-second test not at all. Counter-argument recorded honestly: the site honours `prefers-reduced-motion` but ignores `prefers-color-scheme`, and respecting one stated preference while ignoring the other is the weak point of the position |

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
**216** vendored skill files before publishing · #9 wordmark (owner protocol: options produced before
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
