# Recognition — provenance for the awards on `/cv`

The Recognition list in `src/data/cv.js` renders on `/cv`. This file records where each entry
comes from, so the claim traces to a source rather than to memory.

## What `VERIFIED` means for a credential

The status legend in [`README.md`](README.md) is written for code — *"read directly in code,
config, or CI. Cite the file path."* A credential has no file path in a repository, so the
same bar is met differently, and it is written out here rather than stretched silently:

> A recognition is `VERIFIED` when a **primary document** states the claim in its own words,
> **and** at least one **independent source** corroborates that the event, issuer or programme
> is what the entry says it is. Both are cited. The entry on the site uses the primary
> document's wording, never a paraphrase of it.

Anything meeting only one of those two is `REPORTED`.

---

## `VERIFIED` — Anthropic Claude Community Impact Lab hackathon, Bengaluru, August 2026

**As it renders on `/cv`:**

> Anthropic Claude Community Impact Lab hackathon (Bengaluru, August 2026) — runner-up,
> Superhuman Lab: AI × Hardware for Assistive Tech

**Primary document.** A *Certificate of Achievement · Runner-Up*, dated for the event of
**August 8–9, 2026**, naming Rohit Agrawal and reading: *"secured runner-up at Superhuman
Lab — AI × Hardware for Assistive Tech, at the Claude Community Impact Lab held in Bengaluru on
August 8–9, 2026."* Signed by **Shubhangi Gupta** (Claude Code Ambassador) and **Rohaan
Goswami** (Founder, Elseplay). Issued at Polaris School of Technology, Bengaluru.

**The certificate is deliberately not committed to this repository.** It is a personal document
and this repository is public. It is held by the owner and was read directly on 2026-08-27.

**Independent corroboration — the event.** The public event page,
<https://luma.com/claude-54qf>, titles it *"Impact Lab | Bengaluru - Superhuman Lab"*, presented
by **Claude Community Events**, and describes it as *"a 2-day interdisciplinary hackathon where
AI engineers, hardware tinkerers, artists, product designers, persons with disabilities and
their caregivers come together."* Dates and city match the certificate. This is what licenses
the word **hackathon**, which the certificate itself does not use.

**Independent corroboration — the "Anthropic" prefix.** The event's own confirmation mail is
sent as *Claude Community Events* with a **reply-to on the `anthropic.com` domain**. Claude
Community is therefore Anthropic's community programme, even where a given event is
ambassador-hosted.

**A correction, kept because corrections stay.** I first queried the prefix on the strength of
the Luma page alone, which names individual hosts and a partner organisation, and suggested it
might over-attribute the event to Anthropic. The owner produced the mail header. **He was right
and the page I read was the weaker source.** The prefix stands.

### Wording decisions, each with its reason

| Decision | Why |
|---|---|
| **"runner-up"**, not "second prize" | The certificate's own word. It never says *second* or *2nd*. The list already distinguishes these carefully — *"BugATAhon 2016 — regional 2nd runner-up"* |
| **"Impact Lab"**, not "Cloud Codes Competition" | The owner first described it that way from memory; the certificate and the event page agree on Impact Lab |
| **Team name omitted** | The owner's call. The certificate records team *FOF – Fans of Fun*; hackathon placements are understood to be team results, and the name carries no signal a recruiter needs |
| **No approximate caveat** | P-25 removed the disclaimers from `/cv`. None is needed here: this is a dated certificate with two named signatories, which is exactly what the honesty rule asks for |

---

## The four earlier entries — `UNRECORDED`, not unverified

`Oracle Rockstar Award (2024)`, `Amazon D2AS Innovation Finalist`, `Customer Excellence Awards,
Subex` and `BugATAhon 2016` predate this file and have **no provenance recorded anywhere**.
That is a gap in the record, not a judgement on the claims — they may well be documented in the
owner's own files. Filed as **DEF-75** rather than repaired here, because reconstructing four
credentials is its own package and needs the owner's documents.
