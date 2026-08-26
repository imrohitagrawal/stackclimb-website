# RCA-010 — letter-spacing survives into the PDF and breaks text extraction

**Status: written before the fix, per the AGENTS.md order, on 2026-08-27.**

DEF-74 says the CV's **section labels** extract as `EXPE R IE N C E`. Extracting the text before
touching anything shows the row is **right about the defect and wrong about where it is.**

## What happened

`src/styles/cv.css` sets `letter-spacing` on five selectors and nothing resets it under
`@media print`. Tracking is a typographic device for the screen; in a PDF it becomes real
horizontal space between glyphs, and a text extractor that sees a gap wider than its threshold
inserts a space. The rendered page looks correct, so nothing about this is visible to the owner.

## The measurement

`/cv` rendered to A4 under print media, then read back with `pypdf`. The lines an extractor
returns, verbatim:

| Extracted | Selector | `letter-spacing` |
|---|---|---|
| `'EXPERIENCE'` · `'TECHNICAL'` · `'RECOGNITION'` · `'IN SHORT'` · `'INDEPENDENT SYSTEMS'` | `.cv-section h2` | 0.16em — **clean** |
| `'J U N E  2 0 1 4  —  A P R I L  2 0 1 5'` | `.cv-dates, .cv-state` | 0.1em — **broken** |
| `'J U L Y  2 0 1 1  —  J U N E  2 0 1 4'` | same | **broken** |
| `'T E S T  E N G I N E E R I N G'` · `'A U T O M A T I O N'` · `'P L A T F O R M  A N D  D E V O P S'` · `'L A N G U A G E S'` · `'D A T A  A N D  B A C K E N D'` · `'O B S E R V A B I L I T Y'` | `.cv-row dt` | 0.12em — **broken** |

**So the section headings are not the problem — the employment dates and the skill-group labels
are.** DEF-74's row named the wrong elements, and its example, `EXPE R IE N C E`, is the one
string that survives this extractor intact.

**Both observations are true, and the reason matters.** The owner produced `EXPE R IE N C E` by
copying out of a PDF viewer; `pypdf` returns that heading clean. Different extractors use
different gap thresholds, so the same file mangles different runs depending on what reads it.
**The severity is not fixed, which is an argument for removing the cause rather than tuning
around it.** Nothing here should be read as "the headings are safe" — only as "this extractor
happened to cope with them".

## Why it is MEDIUM and not cosmetic — revised, and it is worse than the row said

Applicant-tracking systems parse a CV into fields. The row's concern was section headings. The
measured damage is to **dates** and **skill labels**, and dates are the worse loss:

- **`J U N E  2 0 1 4  —  A P R I L  2 0 1 5` will not parse as a date range.** Date parsing is
  what drives an ATS's "years of experience" calculation and its chronology checks. A CV whose
  dates do not parse can be scored as having no verifiable history.
- **Skill-group labels are the keys of the skills block.** The values under them — the actual
  technology names — extract cleanly, so the loss is the grouping rather than the keywords. That
  is the milder half.

And it is **invisible**: the PDF renders perfectly. Nobody proofreading the document would see it.

## Where it was introduced

At the **styling stage**, when tracked caps were chosen for the CV's labels — a deliberate and
good typographic decision for the screen. The omission is the print reset, not the tracking. No
one asked what the tracking would mean to a machine reading the file, because until the site
began telling readers *"printing it produces a PDF you can forward"* the PDF was not a product.

## Where it was caught

By the owner, pasting out of his own downloaded CV — the same way he caught the three defects
before it. Not by any gate. There is no gate that reads the PDF back, which is exactly the gap
this package closes.

## Cost

Zero measurable so far, and unknowable by nature: an ATS that mis-parses a CV does not report
back. What it becomes if left: every application submitted as a PDF carries unparseable dates.

## The fix

Reset `letter-spacing` to `normal` inside `@media print` on the tracked selectors. The screen
keeps its register; the PDF gets glyphs at natural advance, and an extractor reads words.

**And gate it,** because this class is invisible without one: render `/cv` to PDF, extract the
text, and fail on any run of single characters separated by spaces. `pdf-parse` is already a
declared dependency, so it costs no new package.

**WHICH CHANGE TURNS IT RED:** put any `letter-spacing` back on a `.cv-*` selector without a
print reset, and the gate finds the spaced-out run it produces.
