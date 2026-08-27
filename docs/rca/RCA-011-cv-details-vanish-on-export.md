# RCA-011 — /cv's Independent Systems section vanishes from every export

**Status: written before the fix, per AGENTS.md's order, on 2026-08-28.**

D153 (the three-page critique) flagged this as P1. This RCA reproduces it from a clean build,
independent of the critique's own numbers, per AGENTS.md's "execution is the source of truth."

## What happened

`/cv` renders six `<details class="cv-proj">` cards under "Independent Systems" — each holding a
project's description, GATE/RULE statements, and Visit/Evidence URLs, collapsed by default (P-9).
Two different export paths both read the page **without opening them first**, so both drop the
same content:

1. **Print (PDF).** `cv-print.css:77` — `.cv-proj:not([open]) > *:not(summary) { display: block
   !important }` — tries to force the collapsed content visible on paper. It does not work: Chrome
   now hides a closed `<details>`'s body via `content-visibility: hidden` on the internal
   `::details-content` pseudo-element, a UA-stylesheet rule this selector does not reach. The
   `display: block` it does write is irrelevant once `content-visibility` has already removed the
   box from rendering.
2. **Copy (clipboard).** `src/scripts/copy-cv.js` clones the plate and reads `copy.innerText`.
   `innerText` reports only what actually renders — same UA behaviour, same loss — and the script
   never sets `d.open = true` on the clone's `<details>` elements before reading.

A second, unrelated defect shares the same page: `.cv { padding: 0 }` (`cv-print.css:55`) is meant
to strip the screen plate's padding for print, but `.plate` (`global.css:84`) sets `padding`,
`min-height: 100svh` and `display: grid` at equal specificity (one class each) and is later in
source order, so it wins the cascade. Page 1 of the PDF renders with the screen plate's full
vertical centring intact — mostly blank — before any CV content starts.

## The measurement

Reproduced fresh from `git status` clean / `npm run build`, serving `dist/` with Playwright
Chromium, printing at **Chrome's real default margins (0.4in all sides)** — not Playwright's
`page.pdf()` default of no margin, which the existing gate uses and which hides page 1 of this
defect (see "why nothing caught it," below).

```
=== .cv computed style under print media ===
{ paddingTop: '88px', minHeight: '720px', display: 'grid' }   // expected: 0, 0, block

=== PDF text (0.4in margins), pdf-parse (wraps pdfjs, what Chrome's viewer runs) ===
Delhi-NCR                -> MISSING
citevyn.stackclimb.com   -> MISSING
Evidence                 -> MISSING
stackclimb               -> MISSING
GATE                     -> MISSING   (checked as a \bGATE\b token, not a substring — 0 matches)

--- context around "NarraTwin" in the extracted PDF text ---
"...StarHub.
INDEPENDENT SYSTEMS
CiteVyn 	LIVE
Quorum-AI 	LIVE
SaafSaans 	DEPLOYED — SLEEPS WHEN IDLE
NarraTwin AI 	PHASE 1 — NO-GO
EvalAxis 	IN PROGRESS — CLOSED
Aegis Contracts 	IN PROGRESS — CLOSED
TECHNICAL..."
```

Six names, six statuses, nothing else. `NarraTwin AI — PHASE 1 — NO-GO` prints with no
surrounding context — the site's stated honesty move (disclosing a failed project) reads as a bare
failure line with nothing around it explaining what NarraTwin is.

```
=== Clipboard (copy-cv.js, real click, real navigator.clipboard) ===
Delhi-NCR                -> MISSING
citevyn.stackclimb.com   -> MISSING
NarraTwin                -> PRESENT
PHASE 1                  -> PRESENT
GATE                     -> MISSING
```

Same loss, same cause, second surface.

## Why nothing caught it

`tests/pdf-text.spec.js` anchors on `'Rohit Agrawal'`, `'Oracle'`, `'Bengaluru'` — all outside any
`<details>` — and calls `page.pdf({ format: 'A4', printBackground: true })` with no `margin`,
which Playwright defaults to **0** on every side. Chrome's own default when a user actually prints
is **0.4in**. At 0 margin there is more usable page height before the `.cv` padding/min-height bug
pushes content down, so the page-1 defect does not reproduce at the gate's own margins — one of
two reasons this shipped past a fully green suite. The gate proves the extracted text is
well-formed. It never asserted the text was complete.

`tests/cv-copy.spec.js` (checked, not assumed) asserts the two footer buttons and the print note
are stripped from the clipboard text — it does not assert any project content is present.

## Where it was introduced

`cv-print.css` was extracted from `cv.css` in D151 (DEF-74), and its `<details>`-forcing rule was
written against the display behaviour `<details>` had before Chromium moved the collapse mechanism
onto the internal `::details-content` box (a change to Chrome's UA stylesheet, not to this repo's
code — `display: none` on the summary siblings used to be the whole story; it is not the current
mechanism). `copy-cv.js` (P-22, 2026-08-27) was written and reviewed without a probe that checked
whether closed-details content survives `innerText` on a clone.

## Where it was caught

Not by any gate. By D153's critique, reading the actual extracted PDF and clipboard text rather
than trusting that "PDF renders" or "copy button works" meant the content was in it.

## Cost

The Independent Systems section is the CV's evidence for six built systems — descriptions,
GATE/RULE statements, Visit/Evidence links. Every export path (PDF forwarded to a hiring manager,
plain text pasted into an ATS) drops all of it and leaves six bare name/status rows. The one
disclosure the site is proudest of — stating NarraTwin's No-Go plainly instead of hiding it — reads
worse this way than if it were omitted: a failure line with no surrounding evidence of the
practice that produced it.

## The fix

1. `cv-print.css`: replace the ineffective `.cv-proj:not([open]) > *:not(summary) { display: block
   !important }` with a rule that also restores `content-visibility` on the pseudo-element, e.g.
   `.cv-proj:not([open])::details-content { content-visibility: visible !important }`, alongside
   (not instead of) the existing `display` rule, since other engines still gate on `display`.
2. `cv-print.css`: raise the specificity that strips the screen plate's frame instead of fighting
   source order — `.cv.plate { padding: 0 !important; min-height: 0; display: block }` (two
   classes beats `.plate`'s one, regardless of source order; `!important` only where a screen rule
   also uses `!important` and would otherwise still win).
3. `copy-cv.js`: `copy.querySelectorAll('details').forEach((d) => { d.open = true; })` on the
   clone, before reading `innerText` — after the existing button/note/skip-link removal, so those
   still do not appear in the pasted text.

**And gate it**, because this class is invisible without one: extend `tests/pdf-text.spec.js` to
assert *presence* (`Delhi-NCR`, `citevyn.stackclimb.com`, a `\bGATE\b` token) and a page-1 ink-fill
floor, printing at **0.4in margins**, not Playwright's default. Extend `tests/cv-copy.spec.js` (or
add a case) to assert the same presence probes in the clipboard text.

**WHICH CHANGE TURNS EACH RED:**
- Revert the `::details-content` rule, or remove it while leaving `display: block` alone → the
  presence probes fail again (reproduces the measurement above).
- Revert the `.cv.plate` specificity fix → `getComputedStyle('.cv')` under print returns
  `padding-top: 88px` again and the page-1 floor fails.
- Remove the `d.open = true` line from `copy-cv.js` → the clipboard presence probes fail again.

## A conflict raised, not silently resolved

D153's plan (`docs/plan/critique-three-pages.md`, P1) lists a fourth item: removing the colophon's
"and marked approximate" tail because it "contradicts P-25 on the one page gated to not carry it."

`docs/OWNER-DIRECTIVES.md` row **P-26** already settled this, one day before the critique that
produced D153: *"The two remaining `approximate` strings on `/cv` stay: the P-9 evidence label on
the Aegis card, and the site-wide colophon line, which `@media print` hides so it never reaches
the PDF. Neither was in his complaint."* `tests/proof-cv.spec.js` itself says the same thing in
its own comment (lines 37–41): its scope is "deliberately narrow," matches disclaimer *sentences*
not the bare word, and explicitly excludes "the site-wide colophon line" as "a different device
with a different job" that "does not print."

Both cannot hold. Either P-26 is stale and should be revisited, or D153's P1 item is wrong and
should be dropped. **I think D153's item is wrong** — P-26 is the more recent, more specific
ruling, it was made after weighing exactly this tension (the colophon's "approximate" wording
against P-25's removal from `/cv`'s body), and its stated reason (the colophon doesn't print, so
it can't recreate the "credibility-lowering" box P-25 was actually about) still holds under
inspection: verified above, `cv-print.css:38` already hides `.colophon` under `@media print`
entirely. **Everyday version: P-25 was about a warning label printed next to the numbers on the
document a recruiter holds. The colophon is a line in the site's own footer, on-screen only — it
never leaves the browser. Editing the footer to fix a complaint about the PDF is like repainting a
sign in the lobby because a customer complained about the packing slip.**

The `/experience` half of that same plan item is different and not contested: `/experience`'s
"every approximate figure marked as such" is a factual claim **about `/cv`'s content**, and it is
now false — P-25 removed every approximate marking from `/cv`. That sentence is stale regardless of
the colophon question and belongs in this package.

**Recommendation:** fix `/experience`'s stale promise as part of P1; leave the colophon alone
pending the owner's word on which ruling stands.
