# RCA-006 — `PRODUCT.md` lags three rulings the site already honours

**Status: written before the fix, per the AGENTS.md order, on 2026-08-26.** Approval is
split, and the split is the point of this document:

- **Part 1 is covered by a recorded decision** (D74, 2026-08-12) and is fixed in the same
  change as this RCA.
- **Part 2 touches how the owner's career facts are labelled.** Directive P-18 reserves
  self-descriptions to him. It is raised below, in the four-part shape, and **not written**.

## What happened

`PRODUCT.md` was last edited on 2026-08-09 (`138c635`). Three rulings landed after that and
were applied to the built site but never carried back into this file. `AGENTS.md`'s reference
table names `PRODUCT.md` as the answer to *"What is true about the product?"*, so an agent
reading it today is handed the pre-ruling text as truth.

Every site below was located by content, not by the line numbers in P-1's row. Line numbers
are quoted only as measured today (`grep -n`) and will drift.

| Site (by content) | Says today | Ruled otherwise by |
|---|---|---|
| Positioning bullet on SaafSaans (line 58) | *"labels whether a reading is live, deterministic, or sample"* | **D74**: `saafsaans/web/presenters.py:570-572` — the `sample` state was deleted; the real states are `LIVE` / `CACHED` / `NO READING`. The site and `/cv` were fixed on 08-12 |
| Evidence on Hand, *Career facts* (line 157) | *"(self-reported, not independently verified)"* | **RCA-002 ruling 1, P-16** (08-14): the owner ruled the word works against him; figures are marked **approximate** and attributed to their employer. `AGENTS.md`'s voice rule was amended the same day and `self-reported` is a barred string on every built page |
| Same section, the MTTD correction paragraph (line 171) | *"Use the CV's own words, labelled self-reported."* | Same ruling. This is an instruction to future copy, and it instructs the barred word |

Measured today, on the build at `54e6340`:

- `grep -n 'self-reported' PRODUCT.md` → lines **157** and **171** (the line numbers in
  P-1's row happen to still be right; they were checked, not trusted).
- `grep -c 'self-reported' dist/*.html dist/projects/*.html` → **0 on all 9 pages**.
- `grep -n 'deterministic, or sample' PRODUCT.md` → line **58**.

## Where it was introduced

At the **fix stage of two earlier packages**, both of which corrected the site and stopped
there:

1. **D74 (08-12)** fixed the `sample` claim on the home page and — after a reviewer caught
   the miss — on `/cv`. Its own row records the lesson *"the correction did not travel"*.
   It did not travel to `PRODUCT.md` either.
2. **D85 (08-14)** retired *self-reported* from every built page, amended `AGENTS.md`, and
   gated the word. `PRODUCT.md` was not in the sweep.

Neither is a gate gap in the usual sense: the barred-string gate reads **built pages**, on
purpose, and `PRODUCT.md` is not one. The gap is a missing step in the fix protocol — when a
ruling retires a word or a fact, the sweep must include the documents that describe the
product, not only the pages that render it.

## Where it was caught

By the **D102 open-items audit on 08-18**, which found all three sites and wrote them into
P-1's row. Nothing then acted on it for eight days, through eight further packages. That is
the failure `docs/OWNER-DIRECTIVES.md` exists to make visible: a directive recorded as
`PARTIAL` is a debt, and this one is now the oldest open row in the register.

## Cost

- **To a visitor: zero.** The built site is correct and gated.
- **To the next agent: one wrong fact and one barred word, handed over as truth.** An agent
  drafting copy from `PRODUCT.md` would write `sample` — which no gate catches — or
  `self-reported`, which the gate catches only after the copy is written and built.
- **If left: it compounds.** The same file also still says, each refuted by a command run
  today (2026-08-26):

| `PRODUCT.md` says | Measured today |
|---|---|
| The apex serves nothing (Operating Context) | `curl` → **200 in 0.20s** |
| SaafSaans' health is unverified; no response in 45s | `curl` → **200 in 4.2s** (DEF-7, resolved 08-09) |
| Site structure: home, work, writing, about, contact | Built: `/`, `/cv`, `/experience`, `/how-i-build`, `/projects/{citevyn,quorum,saafsaans,narratwin}`, `/404` |
| Undecided: articles, CV download, contact mechanism, hosting | Decided: no articles; `/cv` exists and offers no download (`grep -i download dist/cv.html` → 0); contact is labelled `mailto:` links (P-13); Cloudflare Pages (D2, D3, I-1) |
| CiteVyn: 361 tests, 50/50 golden suite | DEF-31: **1,036** test functions across 110 files, **52** golden cases |
| CiteVyn: Postgres 16 + Redis (reads as self-hosted) | `docs/evidence/README.md`: **REFUTED** — managed Neon and Upstash |

None of these is a self-description. They are product facts with recorded, verified answers.
They are **not fixed in this change** — the queue scoped this package to the three sites
above, and refreshing the rest is the remaining body of P-1 (see Open questions).

## Why now

P-1 is the oldest open directive in the register, and `AGENTS.md` says: *"Do not start new
work while an OPEN directive is older than the work being proposed, without saying so."*
Every remaining queue item is younger than it.

## The fix

**Part 1 — in this change.** The SaafSaans bullet names the three real states and cites
D74. Not owner-reserved: it is a fact about a product, verified in that product's source,
decided on 08-12, and already on the site.

**Part 2 — after the owner's word.** Lines 157 and 171 are not touched. The proposal:

- Line 157, before: `**Career facts** (self-reported, not independently verified): …`
- Line 157, after: `**Career facts** (`REPORTED` — from his CV; the site marks each figure
  approximate and attributes it to the employer concerned, per P-16): …`
- Line 171, before: `Use the CV's own words, labelled self-reported.`
- Line 171, after: `Use the CV's own words, marked approximate and attributed to the
  employer (P-16).`

`REPORTED` is the evidence base's own status word (`docs/evidence/README.md`): *stated in the
project's own docs, plausible, not independently checked.* It keeps the honest evidence grade
inside a document that is not the site, in the vocabulary the repo already uses, without the
word the owner rejected.

## Open questions for the owner — the P-18 check, in four parts

1. **The exact ask.** Is applying your 2026-08-14 ruling (P-16) to `PRODUCT.md` lines 157
   and 171 the *application* of a decision you already made — so I may write it — or a
   *new* self-description decision you want to word yourself?
2. **Current behaviour.** `PRODUCT.md` qualifies your career facts as *"self-reported, not
   independently verified"* and instructs future copy to label them *self-reported*. The
   built site says neither, anywhere, and a gate keeps it that way.
3. **Suggestion and expected behaviour after.** The two lines above. After: no document in
   the repo carries the retired word; the qualifier uses the evidence base's `REPORTED`
   grade plus your approximate-and-attributed rule.
4. **Where your input is needed, and where it is not.** Needed only on the wording of the
   career-facts qualifier (Part 2). Not needed on Part 1 (D74 covers it) and not needed on
   the remaining-debt table — but one word from you settles whether that table is refreshed
   in a follow-up change **without** a re-interview (mechanical, every answer is already in
   the ledger) or held until the full re-interview P-1 originally asked for.

My position, stated because a conflict raised without one wastes your time: **Part 2 is your
ruling applied, not a new decision.** The everyday version — you told the tailor on 08-14
never to write "customer's own claim" on the ticket again, and the shop floor complied; the
order book in the back office still has the old instruction pencilled in. Updating the book
is not a new instruction. I have still not written it, because you asked to see it first.

## Decision line

- Part 1: **approved by D74**, fixed in this change.
- Part 2: **approved by the owner 2026-08-27 ("Yes do it")** — written as proposed, D134.
- Remaining debt table: **approved 2026-08-27 ("refresh them")** — all six refreshed, each
  re-verified that day and carrying a dated note of what it used to say, D134.
