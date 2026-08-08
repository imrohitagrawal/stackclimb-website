# Inbox — drop files here for the next session to pick up

Anything the owner needs to supply lands in one of the three folders below. A session that
finds a file here wires it into the site; a session that finds a folder empty says so in its
report rather than inventing a substitute.

## `photo/`  — the portrait

One image. **Tracked in git** — it ships on the site, so it is not a secret.

- Landscape or square crop, plain background, **≥ 1200px on the short edge**
- JPG or PNG. Any filename; the session will rename it
- **Never a visiting card.** Those carry a mobile number and a LinkedIn QR rendered as pixels.
  Every text-based secret scanner missed them once already, and they reached a commit. See
  `.gitignore`.

Destination: an avatar beside his name in the hero lede (D27). A larger crop may also sit
beside the lifecycle diagram on the Approach page.

## `resume/` — the CV source

**Tracked in git.**

D31 chose a printable `/cv` page over a PDF upload: a page is indexable, cannot go stale
silently, and a recruiter can still print it to PDF and forward it.

Either form works:

- **A PDF or DOCX** — the session reads it and builds the page from it
- **Plain text or markdown** — faster and less error-prone

What is actually missing is small. For **Amazon, LimeRoad, Mobileum, Snapdeal, Subex**:
title, years, and one line on what he owned. Oracle is already on record
(Principal MTS, Apr 2019 – Apr 2026, 11+ engineers mentored).

`PRODUCT.md:101` marks résumé content *"Undecided — do not invent"*, so a session may not fill
these in from inference.

## `brand/` — wordmark and logo candidates

**NOT tracked in git.** `.gitignore` excludes everything here except this README.

Two reasons, both learned the hard way on 2026-08-07:

1. **Privacy** — brand files have carried personal contact details as pixels before.
2. **Protocol** — Claude produces its own wordmark options *before* seeing the owner's, or the
   second opinion is just a reaction to the first.

The chosen mark gets added deliberately, as a single file, after review — not swept in by
`git add -A`.

---

**A session that uses anything from here must record it in `docs/STATUS.md` in the same change,
naming the file it used.**
