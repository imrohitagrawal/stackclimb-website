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

`/cv` rendered to A4 under print media, then read back — **with two different extractors, which
turned out to be the whole point.**

**`pdf-parse`, which wraps pdfjs — the engine Chrome's own PDF viewer runs, and therefore what
the owner was copying from:**

```
"I N  S H O R T"   "E X P E R I E N C E"   "I N D E P E N D E N T  S Y S T E M S"
"T E C H N I C A L"   "E D U C"   "I O N  A N D  C E R T I F I C"
```

**19 spaced-out runs, and zero parseable date ranges.** This reproduces the owner's report
exactly. His `EXPE R IE N C E` and this `E X P E R I E N C E` are the same defect.

**`pypdf`, a different implementation, on the identical file:** the section headings come back
**clean** — `'EXPERIENCE'`, `'TECHNICAL'` — while the dates and skill labels still break:

```
'J U N E  2 0 1 4  —  A P R I L  2 0 1 5'      <- .cv-dates,  0.1em
'T E S T  E N G I N E E R I N G'               <- .cv-row dt, 0.12em
```

### A correction to this document's own first draft, kept because corrections stay

The first version of this RCA, written after reading **only** the `pypdf` output, concluded that
*"the section headings are not the problem"* and that DEF-74's row **named the wrong elements**.
That was wrong. The row was right; I had generalised from one extractor.

**It is the fourth time in this session that a conclusion came from an incomplete or
unrepresentative sample** — after a headlessly-generated PDF, and twice after captures with
images that had not loaded. The lesson is not "use pypdf" or "use pdfjs". It is that **severity
here is a property of the READER, not of the file**, so the gate must remove the cause rather
than satisfy one extractor. The gate uses pdfjs precisely because that is what a recruiter's
viewer runs.

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
