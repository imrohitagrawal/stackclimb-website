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

**Amended 2026-08-27, because the bar above cannot be met by an internal award.** A recognition
given inside a company is never published, so *"independent corroboration"* is impossible by
construction — applied mechanically, the rule would make every internal award permanently
`REPORTED`, which is not a judgement about evidence, it is an artefact of a rule written for one
case. The amendment:

> An **internal** recognition is `VERIFIED` when the primary document was **issued by the
> awarding organisation rather than written by the claimant** — an award mail from the
> programme's own address, naming the person and the citation, signed by someone in that
> organisation. Its limitation is recorded with it: it cannot be checked from outside the
> company, and the entry on the site must not imply otherwise.

That is the same posture `AGENTS.md` already takes on employer figures — attributed to their
employer, with the limits of the source stated rather than hidden.

---

## `VERIFIED` — Anthropic Claude Community Impact Lab hackathon, Bengaluru, August 2026

**As it renders on `/cv`:**

> Anthropic Claude Community Impact Lab hackathon (Bengaluru, August 2026) — AI × hardware for
> assistive tech, runner-up

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
| **Track name "Superhuman Lab" not on the line** | It is a brand a reader outside the event cannot decode. *"AI × hardware for assistive tech"* is the same fact in words that carry meaning. The full title is recorded above, so nothing is lost from the record |
| **Placement LAST** | This list's own pattern — *"BugATAhon 2016 — regional 2nd runner-up"*. The first version wedged "runner-up" between the event and the track, which split one idea in two |

---

## `VERIFIED` — BugATAhon 2016, regional 2nd runner-up

**As it renders on `/cv`:**

> BugATAhon 2016 — regional 2nd runner-up

**Primary source, and it is a third party's, which is the strongest kind.** The organiser's own
results page — Agile Testing Alliance, <http://bugatahon.agiletestingalliance.org/> → *Winners* →
the **NOIDA** tab — lists under *Winners List*:

| Rank | Name | Company |
|---|---|---|
| 3 | **Rohit Agrawal** | LimeRoad |

Read 2026-08-27. **The page is still live**: `curl -o /dev/null -w '%{http_code}'` returns
**200** over HTTP. It is HTTP-only — HTTPS does not resolve — so cite it as `http://`, and treat
its long-term availability as unguaranteed; a screenshot is held by the owner as the fallback.

Only the owner's own row is recorded here. The page names other participants and they have no
business in this repository.

**Why "2nd runner-up" is the right words for rank 3.** Winner → 1st runner-up → 2nd runner-up.
Rank 3 is the second runner-up, so the entry neither inflates nor understates.

**Why "regional" is right.** The results page carries a tab per city — Pune, Mumbai, Bangalore,
Vadodara, Noida — so this is the placement in the Noida edition, not a national final.

**Corroboration of identity.** The row gives the company as **LimeRoad**, which matches the CV's
own employment line for that period (Senior SDET · LimeRoad, October 2015 – May 2017). The
placement, the person and the employer agree across two independent records.

---

## `VERIFIED` — Subex internal recognitions, 2013. **But the CV calls them the wrong thing.**

**As it renders on `/cv` today:**

> Customer Excellence Awards, Subex — multiple

**The documents.** Two award mails supplied by the owner on 2026-08-27, both sent from Subex's
own recognition programme — sender address `stars@subex.com`, subject *"CONGRATULATIONS! You
have been awarded!"*, each rendering a citation block headed **Citations** with his name on it:

| Sent | Citation, in the mail's own words | Signed by |
|---|---|---|
| 29 January 2013 | **"Pat on the Back"** | an Associate Manager, Support |
| 8 April 2013 | **"1500 Points"** | a Director, Global Support |

Issued by the organisation, not written by him, which is what meets the amended bar above.
His role at the time reads *Product Specialist*, matching the CV's own Subex line
(July 2011 – June 2014).

**Colleagues are recorded by role, not by name.** The hackathon certificate is a public document
and its signatories are named there; these are private internal mails, and putting a former
colleague's name into a public repository because it happened to appear in one is not something
the record needs. Phone numbers and mail addresses in the screenshots are likewise not recorded.

### What these captures do and do not settle

**They do not name the award, and that is a limitation of the CAPTURE, not of the claim.**
Both screenshots show broken-image placeholders — one above the name block, one above the
`Citations` table. The owner confirmed on 2026-08-27 that the award name was rendered in those
images, and Gmail did not load them.

So, stated exactly:

| | Status |
|---|---|
| Multiple internal recognitions at Subex in 2013 | **VERIFIED** — two mails, from the organisation's own programme address, two different signatories, dated |
| The **name** of those awards | **NOT SETTLED.** The naming lived in images that did not render. These captures neither confirm nor refute *"Customer Excellence Awards"* |

**A correction to my own first reading, kept because corrections stay.** On seeing only the text
that rendered — the programme address `stars@subex.com`, and citations reading *"Pat on the
Back"* and *"1500 Points"* — I drafted a finding that the mails contradicted the CV and proposed
renaming both entries to *"Subex STARS recognitions"*. **That was wrong, and it was wrong in the
way this session has already been wrong once**: I treated an incomplete artefact as the whole
one, exactly as with the headlessly-generated PDF. Absence of the name in a capture with broken
images is not evidence the name is absent. The owner caught it before it was committed.

### What would settle it, and it is one click

Open either mail in Gmail and choose **"Display images below"**, then re-capture. If the loaded
graphic names a Customer Excellence Award, the CV's wording is confirmed and both entries stand
as written. If it names something else, the entries follow the document.

Until then **nothing changes on the site.** The current wording is not being defended and not
being corrected; it is simply not yet checkable from what is in hand.

### One thing these documents genuinely do not reach

The Subex role's bullet also carries **"99% SLA adherence"**. No award mail speaks to a service
level, loaded images or not. That is an employer figure, governed by P-16 and attributed
accordingly — noted here only so it is not mistaken for something these two documents support.

---

## The two remaining entries — `UNRECORDED`, which is not `UNVERIFIED`

`Oracle Rockstar Award (2024)` and `Amazon D2AS Innovation Finalist` have **no provenance
recorded anywhere**. The owner has confirmed (2026-08-27) that he holds no documents for them.
Subex moved out of this group the same day, on the two award mails recorded above.

**This is a gap in the RECORD, not a doubt about the claims.** All three are internal employer
recognitions, which by their nature are not published — the same category `AGENTS.md` already
handles by marking employer figures approximate and attributing them. They stay on the site as
they are.

**DEF-75 stays open as a record gap, not as a defect to chase.** If an internal citation, award
mail or announcement ever surfaces, log it here to the bar above. Do not go looking for
substitutes, and never reconstruct a credential from memory — that would be inventing one.
