---
target: src/pages/index.astro (home page)
total_score: 22
max_score: 32
na_heuristics: 9,10
p0_count: 1
p1_count: 2
timestamp: 2026-08-23T21-34-02Z
slug: src-pages-index-astro
---
Method: dual-agent (A: general-purpose subagent, design review · B: general-purpose subagent, detector + measured browser evidence)

Both agents independently found that `localhost:3000` is NOT this site — it serves an unrelated
Excalidraw POC, and no Astro dev server was running. Both fell back to the committed `dist/` build,
verified current (`find src public astro.config.mjs -newer dist/index.html` returns empty). Every
number here is Playwright-measured at 1440x900 and 390x844 against that build.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Every system prints a real state, but the hero's closing verdict renders fractured, and five state vocabularies ship with no legend |
| 2 | Match System / Real World | 3 | The overview's plain-English lines are the best copy on the site; plate titles ("Carried, not shown") are private vocabulary a recruiter must decode |
| 3 | User Control and Freedom | 3 | Persistent nav, working anchors, Replay, persisted motion toggle. No back-to-top on a 12,962px page; mailto is a one-way door |
| 4 | Consistency and Standards | 3 | Highly disciplined, with four real breaks — all clustered on the private plate and the caption strips |
| 5 | Error Prevention | 2 | The single conversion path is mailto x4 with no fallback and no visible address |
| 6 | Recognition Rather Than Recall | 3 | The overview index is a genuine recognition device; the five-way state taxonomy is assembled by the reader unaided |
| 7 | Flexibility and Efficiency | 3 | Scored, not n/a: the overview index is a real express lane past four full-screen plates. Gap — unlinked rows look near-identical to linked ones |
| 8 | Aesthetic and Minimalist Design | 2 | Beautiful and over-served: nine full-viewport plates, 15.4 phone screens, every system's state stated three times |
| 9 | Error Recovery | n/a | Static page, no inputs, no failure states. The prior run scored this 2 on broken images — that basis is now refuted |
| 10 | Help and Documentation | n/a | Persuade surface, no task to document |
| **Total** | | **22/32** | **Acceptable (69%)** |

The score went DOWN from 24/32 and nothing regressed. Two of the prior run's findings turned out
to be wrong, and one genuinely worse problem surfaced that the last pass missed entirely.

## Design Specificity Verdict

**LLM assessment (A):** Authored for this product, decisively. The content model IS the design
system. The signature component is a ruled LABEL/VALUE billing strip holding `1.0 hit-rate · 26
answerable` and `Phase 1 — No-Go`; the plate corner prints `DEPLOYED — SLEEPS WHEN IDLE`. A
portfolio with nothing to disclose has nothing to put in these slots. Strip the copy out and the
layout collapses — the correct test. Qualification: the world is more STATED than PRACTICED in two
places — the private plate renders status as a bordered badge (DESIGN.md forbids it), and two of
four artefact panels are illegible at ship size, making the Lit-Surface Rule ceremonial.

**Deterministic scan (B):** Browser detector 96 findings across 91 elements — undersized-ui-text 70,
tiny-text 16, all-caps-body 9, em-dash-overuse 1. CLI on source: 1 advisory. CLI on dist/index.html:
2 findings. THE CLI SCAN RAN DEGRADED and its result is a floor, not a clean bill: `htmlparser2` is
missing (absent from package.json and node_modules), so the static engine fell back to regex and
never evaluated custom properties, selector matching, or computed contrast. Settling command:
`npm i -D htmlparser2`, then re-run.

**Visual overlays:** none available to the user. Injection succeeded in the agent's own tab, which
has since closed. Both temporary servers were stopped and verified at 0 listeners.

## Overall Impression

The central move — showing, not just claiming, that the builder doesn't overclaim — lands.
`PHASE 1 — NO-GO` set in the corner slot a luxury brand gives its monogram is the sharpest idea in
the visual system. The biggest opportunity is the last step: a page built entirely to earn one
email makes that email unreachable for a large part of its own audience, and the gate written to
fix exactly this problem now enforces the opposite of what the visitor needs.

## What's Working

- **The hero practice panel.** Six discipline claims, each carrying a witness derived from
  `projects.js` at build time — so it structurally cannot drift from the system plates — and the
  sixth resolves BLOCKING against its author. It is a report, not a slide.
- **The overview index.** Six rows: name · state · one plain-English sentence · one counted figure ·
  one route. The only place the whole portfolio is legible at once, and its plain-English column
  explains the work to someone not already fluent.
- **State printed as ornament.** Taking the least flattering fact about a project and giving it the
  position of a monogram. Nothing generic can do this, because nothing generic has anything to put
  there.

## Priority Issues

**[P0] The email address is never rendered as copyable text — and the gate meant to fix this
enforces the opposite.**
Verified directly: `dist/index.html` contains the address exactly 4 times, every one inside
`href="mailto:..."`, every visible label reading "Email me". Zero occurrences as readable text.
**Why it matters:** the surface brief's success condition is "a message sent." An in-house recruiter
on a managed corporate desktop often has mailto unbound — the only conversion path silently does
nothing. Even on a working machine the common recruiter action is paste-into-ATS, not compose-now.
Neither is possible.
**The complication:** rendering the address as the link's own text would turn `tests/contact.spec.js:98`
RED — it fails the build if any plate's innerText matches a bare email. That gate traces to directive
P-13 (DONE, raised three times before it stuck). P-13's stated intent is "never text they have to
copy by hand" and it was written against three bare UNLINKED rows; it now reads as banning the
address from appearing at all, a stronger ban than the problem it was written for.
**Fix (recommended, needs the owner's ruling because it touches a DONE directive):** ship a
copy-to-clipboard control. The address lives in the href and a data- attribute, never in innerText —
P-13's gate stays green untouched, and the recruiter gets a one-click paste path, which serves
P-13's intent better than the current state does. Amending P-13 itself is the owner's call to record.
**Suggested command:** /impeccable harden

**[P1] The hero's best sentence ships visibly fractured.**
Confirmed three independent ways. Source: `hero-practice.css:203` sets `.state-pending { display:
inline; animation: practice-hide ... both }` and `practice-hide` (line 138) animates OPACITY ONLY.
With fill-mode both, the pending sentence stays `display: inline` at `opacity: 0` forever, holding
full line-boxes. Assessment A measured the rects; Assessment B independently found
`span.state-pending` in its element census at 9.6px with opacity 0. At 390px the visible verdict
starts at x=258 on line 2 then wraps back to the margin, rendering as "The last / row is the one
that costs me / something. It stays."
**Why it matters:** the emotional peak of the page and the sentence that proves the thesis is the
one element that looks unfinished — on a site arguing its author catches this class of thing.
Secondary: the invisible span sits inside an `aria-live="polite"` region, so a screen reader gets
both contradicting sentences.
**Fix:** stack both spans in one grid cell — `.practice-verdict { display: grid }` with
`> span { grid-area: 1/1 }`. Height reserves as the max of the two. Mark the pending span
`aria-hidden="true"` and drop aria-live.
**Suggested command:** /impeccable polish

**[P1] The entire factual layer is set below 12px — raised last run, unchanged.**
66 elements below 11px at desktop (64 at mobile), 46 more at 11–12px, of 239 text-bearing elements.
Smallest 9.44px (chip-pending, chip-resolved). `dt` at 10.24px x18, `span.t` at 10.56px x20. Counts
are IDENTICAL to the 2026-08-23 run (70 undersized-ui-text + 16 tiny-text). Nothing moved.
**Why it matters:** this register carries the argument — gate states, ledger terms, counted figures —
on the audience least likely to zoom. Sizes are fixed, not clamped, so mobile gets no relief.
Contrast is NOT the problem: 137 of 138 tracked-caps labels pass WCAG AA, tightest real margin
4.55:1. The text is legible in colour and too small in size.
**Fix:** raise the label-tier floor in DESIGN.md — caption-label (0.6rem) and swatch (0.62rem) —
toward an 11–12px floor for anything carrying a fact. Keep tracked caps, just larger. A
design-system edit, not a CSS patch.
**Suggested command:** /impeccable typeset

**[P2] Two of four artefact panels are unreadable at ship size.**
CiteVyn renders full app chrome inside a ~690px column — answer body roughly 5–7px, no citation URL
resolving. NarraTwin compresses six UI panels into a ~690x150 strip. Quorum and SaafSaans are
readable; the difference is those two were cropped via `homeCrop` in `projects.js`.
**Why it matters:** DESIGN.md's Lit-Surface Rule requires "actual system output at a size you can
read." The panel is the only place a visitor sees the software instead of reading about it. An
illegible capture converts the strongest evidentiary device into decoration — what the rule exists
to prevent. The mechanism to fix it already ships and already works on the other two.
**Fix:** crop CiteVyn to one citation card at 100% — the numbered source with its real URL is the
entire claim. Crop NarraTwin to the "Why is deployment blocked?" panel alone. Both need a `crop`
asset and `homeCrop: true`.
**Suggested command:** /impeccable polish

**[P2] The private plate breaks three of the system's own rules at once.**
`<span class="seal">IN PROGRESS · CLOSED</span>` renders as a bordered badge, against DESIGN.md's
explicit "Don't use pills or badges for status; state belongs in the caption strip." The card copy
is centered while every other plate left-aligns — three consecutive centered ragged blocks at 390px.
The AEGIS-CONTRACTS tag overflows its garment shape at both widths.
**Why it matters:** small individually, but clustered on the plate immediately before the contact
ask, and the only place the page visibly stops obeying its own written rules. For an audience being
asked to believe this person enforces his own gates, that costs more than an ordinary polish miss.
**Fix:** move the state into a ledger row or caption cell like every other system. Left-align the
copy. Shorten the tag to AEGIS.
**Suggested command:** /impeccable polish

## Findings Refuted — do not action these

Four claims died under verification. THREE ARE FROM THE PREVIOUS CRITIQUE, which means its backlog
is partly wrong.

1. **"Artefact panel images render broken under fast mobile scroll" (prior P1) — REFUTED.** All 7
   images measured `complete: true` with non-zero naturalWidth at both 1440 and 390 after a rapid
   scroll to bottom. Zero failed requests. The prior run's naturalWidth:0 reading was taken before
   scrolling triggered the lazy load — Assessment B reproduced exactly that artifact and caught it.
   DO NOT add loading="eager"; there is no bug to fix.
2. **"Reduced-motion behavior unverified" (prior P3) — VERIFIED GOOD.** 20 running animations -> 0,
   from the first sample, across 14 samples. End state content-identical: same visible chips, same
   verdict text, same fill widths. Nothing starts and gets cancelled.
3. **"The hero overflows its viewport" (Assessment A P1) — REFUTED as a defect.**
   `tests/plate-height.spec.js:30` reads `const EXEMPT = new Set(['top'])`, and its comment says the
   hero "is the one plate the site deliberately lets run long, and D27 records the decision." A
   decided, reviewable exemption, not drift. The knock-on registration effect is demoted to a
   question below.
4. **flat-type-hierarchy on dist/index.html — false positive.** The degraded regex engine saw 4
   literal sizes; the render has 28 distinct sizes from 9.44px to 92.80px. Artifact of missing
   htmlparser2.

Also clean and measured: ZERO horizontal overflow at 390px (scrollWidth 390 = innerWidth 390),
meeting Definition-of-Done item 6. Focus rings correct and consistent — 2px ochre at 3px offset on
every control tested. Heading outline clean, one h1, no img missing alt.

## Persona Red Flags

**In-house recruiter, managed corporate Windows desktop.** Skims the overview, scrolls to ONE
MESSAGE AWAY, clicks EMAIL ME. Nothing happens, or Windows offers to pick an app from the Store.
She looks for the address to paste into her ATS. It is not there. She tries the nav chip — same
link, same result. The stated success condition is silently unreachable for her, at the last step,
with no diagnosis. The page's only hard failure.

**Hiring manager, cold, ~90 seconds, six tabs open.** Gets the pivot in ~8 seconds — that works.
Spends 25 seconds on the practice panel, the right thing to read. Scrolls once and receives a full
viewport titled TWO LEDGERS, DELIBERATELY KEPT APART — about the site's accounting policy, not about
him. Scrolls again and reaches the overview index, the screen she actually needed, 15 seconds. 60 of
her 90 seconds gone, nothing decided. The best 15-second surface on the site is the third thing she
reaches.

**Senior engineer peer, checking whether the rigor is real.** Largely convinced — counted figures
with named witnesses, the 52/52 gate, the No-Go disclosure. Then he zooms into the CiteVyn capture
to read the citations, because that is the whole claim, and cannot. Then he reads the hero's closing
verdict and sees it fractured. The two places he tried to VERIFY rather than trust are the two
places execution slipped. He concludes the evidence is one layer thinner than advertised — the exact
suspicion the site exists to eliminate.

**VP of Engineering, 48, laptop at default zoom, no reading glasses.** Headline and lede comfortable.
Everything below is 9.44–11.52px. He reads the display type and skips the evidence, inverting the
page's intent: he leaves with an impression of taste and no retained facts.

## Cognitive Load — 5 of 8 items fail

FAIL: single focus (hero has two competing lit centers plus a ledger — seven blocks in one plate);
chunking (practice panel 6 rows, hero ledger 5, proof plate 5+5); one thing at a time (true on
system plates, false on the hero); minimal choices; working memory (reader carries a five-way state
vocabulary, the counted-vs-approximate rule, and the coined term "StackClimb" — shipped three times
because it doesn't stick).

PASS: visual grouping; visual hierarchy (marginal — plate-level exemplary, but everything below the
headline flattens into one 9.6–13px texture); progressive disclosure (clean overview -> plate ->
project page -> CV ladder).

Decision points above the 4-item working-memory limit: the first desktop viewport offers 8 routes —
5 nav destinations plus 3 hero CTAs — and two of those eight leave the home page before the visitor
has seen a single system.

## Minor Observations

- The overview plate's ground shares its hue with the accent. `palette.css:62` sets
  `--ground: #231e0d`, olive at hue 45; ochre is hue ~43. Contrast passes at 4.62:1, but ochre stops
  reading as THREAD on the site's single best scan surface. The One Thread Rule holds numerically
  and fails perceptually.
- Five identical ENFORCED chips precede the one BLOCKING chip. Repetition trains the eye to stop
  before the differentiator, which on mobile is also below the fold.
- Nine all-caps-body hits, the worst a 109-character sentence in caps: "Not claimed — users,
  customers, revenue, production scale...". All-caps costs reading speed most on the longest strings.
- `quorum-crop.webp` serves 700x175 into a 477x119 box — 1.47x DPR headroom, lowest on the page; it
  will soften on a retina screen. No image on the page carries fetchpriority, including the eager
  hero portrait.
- Bottom-of-frame hollows: the contact plate ends ~230px short of its own frame, the overview index
  ~180px. Because the frame is a drawn container, the emptiness is visible in a way a bare section's
  would not be.
- Mobile chrome cost: the fixed nav takes 81px of an 844px viewport — 10%, permanent, on a page
  already 15.4 screens long.

## Questions to Consider

1. Should the two-ledger plate exist on the home page at all? It occupies the most valuable scroll
   position — the first reward after the hero — and is the only plate about the SITE rather than the
   work. The colophon already states the rule in one sentence on every page.
2. Is the overview index in the wrong position, or is the hero? The index is the fastest, clearest
   15 seconds on the site and it is the third screen.
3. The hero exemption is decided (D27) and not reopened here — but was its knock-on effect part of
   the decision? Because the hero runs 167px long at 1440, no plate below it ever aligns to the
   viewport for a scrolling reader: every screenful shows a sliver of the last plate, ~200px of bare
   ground, then the frame. The exemption was recorded for the hero; the cost lands on the other eight.
4. Should artefact legibility be a gate rather than an aspiration? The Lit-Surface Rule says "at a
   size you can read," and nothing in the build measures whether it is. The homeCrop mechanism exists
   and is used on exactly the two panels that work.
5. Why is "StackClimb" defined three times on one page, while the one string a recruiter needs to
   copy is rendered zero times?
