---
target: mockup/index.html
total_score: 22
max_score: 36
na_heuristics: 7
p0_count: 2
p1_count: 3
timestamp: 2026-08-11T10-10-01Z
slug: mockup-index-html
---
Method: dual-agent (A: a59818966183b83a2 · B: aa8af2e8ec86170fa)

## Design Health Score — World A (chosen)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | `awaiting evidence harvest` leaks internal build status to visitors |
| 2 | Match System / Real World | 2 | "Evidence harvest", "Not claimed", "signature proof" — a taxonomy the reader must learn first |
| 3 | User Control and Freedom | 3 | "Described, not linked" is a dead end in link position |
| 4 | Consistency and Standards | 1 | Breaks FOUR named DESIGN.md rules (see verdict) |
| 5 | Error Prevention | 3 | "Not claimed" prevents inferential error; Aegis "Works now: Named, not demonstrated" contradicts its own heading |
| 6 | Recognition Rather Than Recall | 2 | 3 column headers repeat 6x at 0.58rem; columns ragged (4/1/3, 4/2/3, 1/1/2) so position never stabilises |
| 7 | Flexibility and Efficiency | n/a | Persuade surface — no repeat use, no accelerators |
| 8 | Aesthetic and Minimalist | 2 | Seven type registers inside a 400px card; nothing subordinate |
| 9 | Error Recovery | 3 | SaafSaans outage stated rather than discovered by clicking |
| 10 | Help and Documentation | 3 | The `.src` provenance lines ARE the docs — and fail AA at 4.33:1 |
| **Total** | | **22/36** | **Acceptable (61%)** |

## Design Specificity Verdict

World A passes the swap test — ochre-on-navy, double-ruled frame, dotted ledger rows, Bodoni against tracked Archivo caps is an owned system. World B fails outright: strip the copy and it is the default 2025 AI-company editorial layout. Discarding B is confirmed correct, and B's own detector evidence seals it — `#b0682f`, world B's accent, NEVER reaches 4.5:1 on any world-B background (4.20–4.31:1 across every use, including all links).

But the deeper failure: World A is not the site's system. It is a dark skin over a generic card gallery wearing the site's colours. Against committed DESIGN.md it breaks four named rules — eyebrow labels (banned by name), status badges (banned by name), white-grid card gallery (banned by name), and the Lit-Surface Rule.

Deterministic scan: exit 2, 25 findings — 18 design-system-color, 5 design-system-font-size, 1 side-tab, 1 em-dash-overuse (35 em-dashes in body copy).

## Priority Issues

**[P0] The Lit-Surface Rule is abandoned — the site's own measured signature.** `--lit:#f4efe4` is declared and used ONLY as text colour. Zero near-white panels. DESIGN.md:253: "Exactly one near-white surface per plate, and it must hold a real artefact — actual system output at a size you can read… A page that promises 'AI that shows its work' cannot show a wireframe where the work belongs." The mockup paraphrases every artefact in prose and demotes its source to 10px grey. A page whose argument is "I show you the receipt" is showing a description of the receipt. The value ladder also collapses from three steps to two — the "dark and dull" condition rejected 2026-08-08.
Fix: each `Use them now` card gets one `--lit` panel with real recorded output verbatim, path and date beneath. CiteVyn prints the actual claude_api_006 refusal, not the summary.

**[P0] Peak-end inverted — the band ends on its weakest card.** Aegis Contracts is last: proof is a question, `Works now` says "Named, not demonstrated", links say "Described, not linked". PRODUCT.md:30 says the reader is deciding whether the AI move is "real, or aspirational" — the final impression is literally an aspiration.
Fix: cut Aegis from the grid to a one-line mention under the group head; or reorder so the section closes on NarraTwin's No-Go — a gate that held is a disclosure.

**[P1] `In development` renders empty in 5 of 6 cards.** 33% of the densest region showing nothing, six times, in repo-internal vocabulary ("evidence harvest"). Forces a 3-column grid where 2 would do, which is what wraps `Not claimed` onto two lines.
Fix: drop the column when empty; 2 columns default, 3 only where content exists.

**[P1] The credibility layer is the least legible layer.** Measured: `.src` = 4.33:1 (below AA 4.5). `.pending` = 3.57:1. `.links > span` = 4.32:1. axe: 67 color-contrast nodes, 14 of them in world A.
Fix: `.src` to rgba(242,235,221,.72) ≈ 6.6:1 at 0.7rem; replace inline opacity:.5 spans with a class.

**[P1] Every tap target fails.** Measured at 390px: 15 of 15 anchors are 15–16px tall against a 44px minimum. `Use it live →` and `Source →` sit 16px apart, visually identical.
Fix: pad the link row; make `Use it live` primary and `Source` secondary.

**[P2] Mobile portfolio section is 4,136 CSS px — 4.9 iPhone viewports for one section.** Violates DESIGN.md:228, the One-Plate-One-Viewport Rule.
Fix: on mobile render only `Works now`; collapse the rest behind a native `<details>`, which also fixes progressive disclosure and needs no JS.

**[P3] World A dropped the github.com/imrohitagrawal link World B had.** World A's ledger has ZERO outbound links — the chosen world is worse than the discarded one on the axis the product cares most about.

## Persona Red Flags

**Priya (agency recruiter, derived from PRODUCT.md):** cannot find the answer to her only question. "Oracle" appears once at 0.64rem/62% opacity. The 14 years appear on neither section. The distributed-systems-to-AI bridge — the reader's stated primary question — is unanswered. "Two ledgers, deliberately kept apart" reads to her as "this candidate is complicated". She does not know what StackClimb is and may read it as a former employer, inverting "independent StackClimb systems". Her req keywords (LLM, RAG, evaluation, CI) exist only in 0.88rem body copy, never in a heading or chip.

**Riley (hostile senior engineer):** CiteVyn's chip says LIVE; PRODUCT.md:73 records 6.7s cold start. SaafSaans warns, CiteVyn does not — the site is inconsistently honest about the one thing it claims to be consistently honest about. Also: card says "52 / 52 golden cases", PRODUCT.md:126 reads the repo README as "50/50". Two numbers for one gate.

**Jordan (non-technical first-timer):** reads `NOT CLAIMED` as a warning label. The framing that makes it read as strength is stated once, four screens above the last card. `PHASE 1 — NO-GO` reads as *rejected*.

**Casey (mobile):** never reaches `Being built` (~2,400 CSS px in). No primary action — every link identical weight and colour.

## Minor Observations
- `.card .top` uses baseline + wrap; SaafSaans' long chip will wrap below the name and the six cards will disagree on chip position.
- `.grouphead .rule` runs full page width — the rule outweighs its label.
- SaafSaans "628 test functions" is a raw count with no denominator, one card from "52 / 52" which has both.
- The mockup's throwaway closing note is better copy than anything in the cards.

## Questions to Consider
1. Why does a mockup replacing two live sections contain zero artefact panels, when a dual-agent critique already measured the artefact panel as stronger than the alternative?
2. DESIGN.md bans eyebrows, badges and card galleries by name. This ships all three. Either the rules are wrong and get amended with their reason (D49/D50 have the pattern), or the mockup is wrong. D50: "A rule the pixels quietly break is drift."
3. "Two ledgers, deliberately kept apart" — is that heading talking to the reader, or to the author about the author's own integrity?
4. What is "StackClimb" to a reader arriving from LinkedIn?
5. The best sentence on the page is set in the fourth of seven type registers. What would this look like if it were as big as the section heading and everything else were the footnote?
