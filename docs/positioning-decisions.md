# Positioning decisions — 8 August 2026

Agreed in conversation with the owner. Recorded here because a decision held in chat is lost at
the next compaction. Supersedes nothing; extends `docs/STATUS.md`.

**The goal every item below serves:** *within 30–60 seconds, a recruiter or hiring manager should
feel "I should call this person."* Owner's words. That is the acceptance test for the home page,
not a heuristic score.

---

## 1. The headline

**Decided:** use the full positioning line — **"AI systems that show their work and refuse to
fake it."**

- It is already the owner's own line, verbatim in `PRODUCT.md` under Positioning.
- The current headline, "AI that shows its work", is a truncation that claims half of it.
- Cost: roughly five lines at 96px instead of three. Accepted.

**Rejected for the home hero:** *"From customer ambiguity to production evidence."*
Reason — it describes his process, not his systems, and "customer ambiguity" is the one abstract
phrase in it. **Kept as a candidate for the Engineering Operating Model page headline**, where the
subject genuinely is the process.

---

## 2. The contact framing, and an amendment to the voice rule

**Decided:** use pain-addressed framing. Owner's example:
*"If your AI features work in the demo and not in the release, we should talk."*

**The conflict, and how it was settled.** `AGENTS.md` says the site "never pitches, never signals
urgency". I raised that as a blocker. The owner drew a distinction I had collapsed, and he is
right:

> The site must not signal **his** urgency or pitch **from his side**. It absolutely should
> address the **reader's** pain and urgency. Those are two different things.

That distinction is correct and the rule was ambiguous, not violated. **`AGENTS.md` is amended**
to say so, rather than the copy quietly breaking it.

| Not allowed | Allowed |
|---|---|
| "Available immediately", "limited availability" | "If your AI features work in the demo and not the release" |
| Urgency about his job search | Naming a failure mode the reader recognises |
| Superlatives, invented traction | Stating who he is useful to, and why |

---

## 3. Engineering Operating Model — a new page

**Decided:** build it. Assessed as the strongest of the four proposals.

- It answers the question the audience actually has: *is the AI move real, or four weekend
  projects?* Fourteen years of practice answers that; four repos do not.
- It is already planned: `PRODUCT.md:85` names an `about` surface, and **D1 (07 Aug) said
  "split by job"** and was never executed.
- **Asset, unverified:** `PRODUCT.md` lists
  `imrohitagrawal/assets/engineering-lifecycle-{light,dark,mobile-light,mobile-dark}.svg` — a
  four-gate delivery model, said to be responsive and theme-aware. **Not opened yet.** Confirm
  before designing around it.
- **Employment evidence is in scope and welcome** — owner's call: it is what people trust.
  Oracle's MTTD −35% and cycle-time −25% are **self-reported** and ship labelled as such. The
  labelling is part of the argument, not a caveat on it.

---

## 4. "Shift-left by default. Shift-right by design."

**Decided:** keep the substance in the hero in plain words; move the phrase itself to the
Engineering Operating Model page.

- The phrase is true to him — it is in `PRODUCT.md` under Brand Commitments.
- But it is QA vocabulary, and the owner does not want to read as a testing specialist. A
  recruiter skimming for thirty seconds pattern-matches it to "test lead". That is the single
  phrase most likely to mis-bucket him.
- **Agreed hero wording, in substance:** quality, security and evaluation designed in from the
  first week, measured in production, fed back into the next release.
- On the Operating Model page the surrounding context defends the phrase, so it can appear there
  in full.

---

## 5. The overview page — already decided, never built

The owner asked for a bird's-eye view before the detail: purpose, best points, what it gives a
user, what it uses.

**This was never named as a finding.** The `/impeccable critique` snapshot mentions "overview" or
"summary" **zero times**. It found every symptom and prescribed no cure:

- *"Nothing in the first viewport says what the systems do."*
- *"Nav exposes 3 of 7 plates"* — Quorum, SaafSaans and NarraTwin reachable only by scrolling
- *"Page is 10,127px"* on mobile
- Cognitive load: **progressive disclosure — FAIL**

It is also **D1 in the ledger, decided 07 Aug and unexecuted**, and `PRODUCT.md:85` already names
a multi-page structure while the site remains one page.

**Shape agreed in principle** — a contact-sheet plate directly after the hero, one row per
system: what it does, what state it is in, one hard number. Detail plates follow for anyone who
wants them.

---

## 6. Open challenge — the hero refusal card

The owner's objection, recorded before it is resolved:

> "It is probably mostly on the questions asked to the CiteVyn project. It does not conclude or
> tell anything clearly to the user. If someone is reading that, it will not make sense to them
> what we are trying to prove."

**Assessment: he is right, and the risk is worse than 'unclear'.** See the analysis in the same
conversation. Summary of the finding:

- `golden case claude_api_006` is internal vocabulary; a recruiter does not know what a golden
  case is.
- "What is the capital of France?" reads as trivial on a portfolio hero.
- The conclusion — refusing without a source is the *feature* — lives only in the 0.74rem caption
  below the card.
- **Worst reading: a glance sees "REFUSED" against an easy question and concludes the system is
  broken.** The card can be read as evidence against him.

**Not yet decided.** Two candidate fixes are on the table; see `docs/STATUS.md` open items.

---

## 7. The photograph — yes, but not in the hero

Owner asked whether to include one, and whether it would hurt credibility or clash with the hero
diagram and the interaction work.

**Recommendation: include it, on the Engineering Operating Model page, not the home hero.**

**Why include one at all.** A portfolio with no face reads as evasive to a recruiter, and this
site is otherwise almost entirely systems and tables. One human anchor helps.

**Why not the hero.** Three reasons, in order of weight:

1. **The hero has one job and thirty seconds to do it** — what he does, proof it is real, how to
   reach him. A portrait competes with the overview plate for the same space and the same glance.
2. **It shifts the argument from the work to the person.** This site's whole thesis is that the
   artefact is the evidence. Leading with a face quietly contradicts it. Leading with four
   systems and their states does not.
3. **Hiring-norm difference, worth naming plainly.** Photographs on CVs and portfolios are
   normal in India and actively discouraged in US, UK, Canadian and much EU hiring, because
   they invite bias before the work is read. The owner is open to relocation worldwide. Putting
   the photo one click in rather than first-view lowers exposure at the moment of first
   judgement, without hiding anything.

**Does it clash with the lifecycle diagram or the motion work?** No — the opposite. On the
Operating Model page a portrait beside the four-gate diagram reads as *person and practice*,
which is exactly that page's argument. The interaction work in Phase 2 is scroll and pointer
response on cards; a static portrait neither competes with it nor is harmed by it.

**What is needed from the owner:** the file. Landscape or square crop, plain background, at least
1200px on the short edge. It must not be a visiting card or anything carrying a phone number or
QR code — see `.gitignore`, where that has already gone wrong once.

---

## 8. Skills plan for this work

| Phase | Skill | Why |
|---|---|---|
| Pin the claims | `grilling` + `domain-modeling` (Matt Pocock) | Interrogate positioning before copy is written |
| Generate options | `brainstorming` (obra) | Several directions, not one |
| Plan the surfaces | `/impeccable shape` | Two new pages, not a tweak |
| Build | `emil-design-eng` or `high-end-visual-design` | One builder at a time; parallel writers share one tree |
| Evaluate | `/impeccable critique` (dual-agent) + Codex | Measured: Codex found five holes two same-model reviewers missed |
| Before done | `verification-before-completion` (obra) | Mandatory watch-it-fail |

**Review capped at two rounds** (D9), with the circuit breaker.

**Gap closed 08-08 — what was searched, and why each candidate failed or won.**

| Repo | Stars | Licence | Verdict |
|---|---|---|---|
| `coreyhaines31/marketingskills` | 43,542 | MIT | **Rejected.** Known author, most-starred by far, and **not one of its 50 skills covers positioning or messaging** — it is tactics: ads, SEO, email, CRO, pricing. Stars are not relevance |
| `borghei/Claude-Skills` | 464 | **NOASSERTION** | **Rejected on licence.** Its `brand-strategist` cites April Dunford, the actual authority, but GitHub cannot identify the licence. Too risky to vendor into a repo being prepared for publication |
| `zubair-trabzada/ai-marketing-claude` | 2,283 | MIT | Not evaluated in depth — described as a marketing suite, same tactics shape as Corey Haines |
| **`arnabbagxd/Brand-building-skills`** | 481 | MIT | **Chosen.** Has `brand-positioning`, `brand-messaging`, `brand-story`, `brand-voice`, `brand-audit` |

**Why the chosen one passes the how/where-not/what-not test.** `brand-positioning` is ~210 lines
with seven explicit HOW steps, trigger conditions for WHERE it applies, and real anti-patterns
under "Positioning Red Flags":

- *"Positioning that could apply to any competitor in the category"*
- *"A differentiator that's a table stake"*
- *"Positioning the brand can't substantiate with proof points"*

The third is this site's own thesis stated back at it.

**Its named weakness, recorded rather than glossed:** it cites **no established framework** — no
April Dunford, no Geoffrey Moore. It is the author's own synthesis, which by this project's own
rule is evidence of practice rather than a source of authority. **Mitigation:** pair every run of
it with `grilling` (Matt Pocock), which interrogates a claim rather than accepting it. It also
does not say WHERE NOT to apply itself.
