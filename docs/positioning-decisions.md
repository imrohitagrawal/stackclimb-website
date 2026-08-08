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

## 7. Skills plan for this work

| Phase | Skill | Why |
|---|---|---|
| Pin the claims | `grilling` + `domain-modeling` (Matt Pocock) | Interrogate positioning before copy is written |
| Generate options | `brainstorming` (obra) | Several directions, not one |
| Plan the surfaces | `/impeccable shape` | Two new pages, not a tweak |
| Build | `emil-design-eng` or `high-end-visual-design` | One builder at a time; parallel writers share one tree |
| Evaluate | `/impeccable critique` (dual-agent) + Codex | Measured: Codex found five holes two same-model reviewers missed |
| Before done | `verification-before-completion` (obra) | Mandatory watch-it-fail |

**Review capped at two rounds** (D9), with the circuit breaker.

**Recorded gap:** nothing installed covers positioning or messaging. Every skill above is UI,
code quality, or documentation. Per the owner's own rule, search GitHub before authoring one; if
nothing public fits, record what was searched and why each candidate failed.
