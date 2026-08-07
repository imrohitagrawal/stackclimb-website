# AGENTS.md — stackclimb.com

Single source of truth for agent instructions in this repository. `CLAUDE.md` is a thin
pointer that imports this file; **edit rules here, not there.** Convention adopted from
`quorum-ai` and `citevyn`.

## The product

Personal site of Rohit Agrawal at `stackclimb.com`. Astro 5, static output, deploying to
Cloudflare Pages. Application subdomains stay on Fly.io.

Authority order — **the user's words, then these files, then your judgement**:

| Question | File |
|---|---|
| **What was decided, what is open, what was rejected?** | **`docs/STATUS.md`** |
| What is true about the product? | `PRODUCT.md` |
| What does it look like? | `DESIGN.md` |
| What is true about the projects? | `docs/evidence/` |
| What is this surface for? | `.impeccable/surfaces/` |
| Logo and wordmark | `docs/brand/README.md` |

## Non-negotiable: the ledger is updated in the same change

`docs/STATUS.md` records decisions, open items, defects, rejected options, and corrections.

- A decision made in conversation is **not recorded** until it is in that file.
- Update it in the same change that alters any of it — never "later".
- If the file and a conversation disagree, the file is wrong and gets fixed. Chat is not a record.
- Rejected options carry their reason, so the same option is not re-proposed next month.
- Corrections stay. A mistake deleted is a mistake repeated.

Reason, from NarraTwin's governance learnings: *"AI-assisted work often spans many sessions.
Without a status ledger, context compaction, branch switches, merged PRs, and partially completed
stages can cause the next agent run to act on an obsolete plan."*

## Non-negotiable: the voice

**State what is proven. Label what is not. Invent nothing.**

The site's subject is systems that disclose their own limits. Copy that overclaims refutes the
thesis, so this is a correctness rule, not a style preference.

- No invented metrics, testimonials, users, adoption, or press. None exist.
- Self-reported numbers are labelled self-reported. The Oracle outcomes (MTTD −35%, cycle
  time −25%) are self-reported.
- Never call SaafSaans "live" — it is deployed and sleeps when idle.
- NarraTwin's `Phase 1 — No-Go` is stated, not hidden.
- A claim reaches the site only at `VERIFIED` or labelled `REPORTED`. See `docs/evidence/README.md`.

The site states availability as plain fact — roles sought, open to relocation. It never
pitches, never signals urgency, and never explains why it exists. Copy that reads as a
campaign is wrong.

## Non-negotiable: execution is the source of truth

**The source of truth is not what is written. It is what you get by running the code.**

A README, a doc, a comment, a plan, and a skill file are all *claims*. They were true when
written, about a version that may no longer exist. Running the thing is evidence; reading about
it is not.

Consequences, in order of how often they bite:

1. **Never report a visual change without looking at the render.** A successful build is not a
   correct page.
2. **Never state a fact from a doc when a command could settle it.** A `fly.toml` beats a README
   about deployment. A workflow YAML beats a doc about CI. `dig` beats a claim about DNS.
3. **A substring is not a token.** `arize` matched 27 times in CiteVyn; all 27 were "summarize."
4. **Configured is not run.** Two harnesses being present does not prove a cross-review happened.
   Find the artifact.
5. **A test that has never failed has proven nothing.** Every test ships knowing which change
   turns it red.

When execution is impossible, mark the claim `UNVERIFIED`, name the exact command that would
settle it, and say so out loud. Never let a guess wear the clothes of a fact.

## Non-negotiable: which skills may be trusted

A skill is authority only if its provenance is traceable to an external, third-party source.
Skills generated internally by an agent are **evidence of practice, not a source of rules** —
inheriting rules from them launders a model's own output back in as authority.

Prefer skills that say **how**, **where**, **where not**, and **what not to do**. A skill that
only lists what to do is close to worthless; the difficulty is always in the how and the
boundaries.

**Never write a skill that already exists in public.** Search GitHub first. Prefer well-starred
work from known authors — Addy Osmani, Matt Pocock, obra, Anthropic — over anything authored
here. Their skills have been used, tested, and corrected by many people; a fresh one written in
an afternoon is shallow by comparison and carries loopholes nobody has found yet.

**Write a custom skill in exactly two cases**, and record which one applies:

1. Nothing public covers the capability. Record what was searched and why each candidate failed.
2. The capability exists but is **scattered across three or four skills**. Compose the best parts
   into one, credit every source with its licence, and write it to be portable — it will be
   reused on other projects, so it must not assume this repo's paths or stack.

### Skill currency — a phase, not an afterthought

Skills load at **session start**. A skill installed or updated mid-session is not active in that
session. So currency is checked during planning, never during implementation:

| Phase | Action |
|---|---|
| **Plan** | Decide which skills the work needs |
| **Refresh** | `npx skills update` · verify against `skills-lock.json` · record versions in `docs/STATUS.md` |
| **Restart** | End the session. Skills reload on the next one |
| **Implement** | Only now, with skills known current |

Never start implementation on a skill whose currency has not been checked in the current planning
cycle. Most skills carry no `version:` field, so `skills-lock.json`'s `computedHash` is the real
currency signal, not the frontmatter.

Anything installed outside the `skills` CLI — a `dist/*.skill` bundle, a manual copy — is
**unlocked**, has no hash, and cannot be currency-checked. Record it in `docs/STATUS.md` with its
source and install date, and re-fetch it deliberately.

## Non-negotiable: how to write to the owner

Plain English. Every time. Chat, commits, issues, and docs alike.

- **Lead with the answer.** Reasoning after, and only as much as changes what he would do.
- **Short sentences.** Say the thing, not the category of the thing.
- **No jargon.** If a term is unavoidable, define it once, in the same sentence.
- **No invented shorthand.** Never use a phrase he did not use first.
- **No AI filler.** Banned: delve, leverage, seamless, robust, elevate, unlock, supercharge,
  cutting-edge, effortless, empower, "it's worth noting", "that said", "at the end of the day".
- **Bullets over paragraphs** when there is more than one point.
- **Give an example.** A rule without a concrete case is not yet understood.
- **Direct answers.** If the answer is no, the first word is no. Do not warm up to it.
- **Do not re-explain** what he has already acted on.

Bad: *"There are a few considerations worth noting around the approach we might take here."*
Good: *"Skip it. Five of its six sections are server-side, and this site has no server."*

## Non-negotiable: clarity over cleverness

If it works in 50 lines, it does not ship in 200. Delete before you add. A reader should not
need to hold state in their head to follow a file.

## File size and modularization

Context is the scarce resource. An overloaded file poisons every agent that reads it.

**Inherited verbatim from NarraTwin** — `docs/ADR/0047-publication-boundary.md:55` on `main`,
which caps "each new implementation or test module at 250 lines, 32,000 bytes, and 120
characters per line; the entry point is capped at 40 lines."

| Kind | Ceiling |
|---|---|
| Any new module, component, or test | **250 lines · 32,000 bytes · 120 chars per line** |
| Entry point | **40 lines** |
| Pre-existing file already over the limit | **Grandfathered at 500 lines — and may not grow past it** |

Grandfathering is the caveat mechanism, and it is not an escape hatch: an existing oversized
file is tolerated at a recorded ceiling it may never exceed. Exceeding 250 on something new
requires an explicit, written reason — modularize first, and only then justify.

Rules:

1. **One concern per file.** A file that needs "and" to describe it is two files.
2. **Index, don't inline.** A parent file lists and links; it does not restate.
3. **Supersede, don't delete.** When content moves, leave a pointer stub saying where it went
   and why, so existing links survive. Pattern from `quorum-ai/docs/day-one-quality-standard.md`.
4. **Carry-forward audit.** When consolidating, verify every pointer in the old file exists in
   the new one before removing anything.
5. **Budgets must be executable.** NarraTwin's are enforced by preflight code with SHA-256 and
   line-count receipts that "reject any silent growth" — not by prose. Ours become a CI gate.

**Smaller is not the goal.** From the same source: *"Smaller size is not acceptance evidence"* —
seeded-defect recall, rule completeness, and false-positive behaviour are what actually matter.
Do not shred a coherent file to win a line count.

## Review: bounded, executing, and circuit-broken

**Size the fan to the phase.** Planning and architecture get the full expert fan — sequential
investigation anchors on the first theory, and this is where breadth pays. Implementation scales
to blast radius (CiteVyn's T0–T3 model): docs → self-verify; one component → one matched
reviewer; multi-file → parallel fan; security, routing, or config → full fan plus a reviewer
whose explicit job is to break it.

**Reviewers execute. They do not read and assume.** At least one lens must RUN the thing and
report output, not recollection. A reviewer that only reads source is an opinion, not evidence.

**Reviewers are read-only.** Subagents share one working tree. Tell every reviewer IN CAPITALS
not to write, edit, `git checkout`, `git stash`, or `sed -i`. One tree-writer at a time. A
reviewer that must mutate source gets its own copy via `git archive HEAD | tar -x -C <dir>`.

**Scope reviewers to correctness.** A reviewer told to find gaps will find them whether or not
they exist, and chasing every finding produces defensive over-engineering. Correctness and
stated requirements only; everything else is optional.

**Verify before acting.** A five-lens fan in quorum-ai raised 32 findings; independent verifiers
refuted 23. Findings are refuted before they are fixed.

**Two adversarial reviewers on any test change**, always. Tests are where the make-it-pass loop
does its damage: measured, pass-filtered generators keep bug-*validating* tests 59–68% of the
time, versus 4.2% without the filter.

### The circuit breaker

Review is bounded at **two rounds**. Then stop and escalate with the residual list written down —
more rounds is not convergence.

**Stop implementation entirely** when any of these fire:

1. A **new class** of blocking finding appears in a second consecutive review round.
2. The same class of defect appears in two different files or components.
3. Two fixes in a row each introduce a defect.
4. A change needs three or more amended or force-pushed heads after review starts.
5. A gate misses behaviour that an official source documents.

Finding new bugs in every review round is not thoroughness — it is a signal that something
upstream is wrong. Diagnose which before writing another line: a **requirements** miss, a
**planning** miss, an **understanding** miss, or a **coding** miss. Patching cannot fix the
first three, and continuing to patch hides which one it was.

Return to the contract — the invariants and failure matrix — and get *that* reviewed before
implementing again.

## Definition of done

A change is done when all of these hold. "It builds" is not done.

1. `npm run build` succeeds with no new warnings.
2. The change is **seen rendering** — screenshot at desktop **and** mobile. Never report a
   visual change as working without looking at it.
3. Every new claim traces to a `docs/evidence/` entry at `VERIFIED` or labelled `REPORTED`.
4. Keyboard focus is visible on anything interactive; contrast meets WCAG 2.1 AA.
5. Both themes checked where the surface supports them.
6. No horizontal page scroll at 390 px.

## Verification, before assertion

Run the cheapest command that settles a question before stating an answer. Never let a guess
wear the clothes of a fact — say `UNVERIFIED` and name the check instead.

Two failures already recorded in `docs/evidence/README.md`, both from trusting a grep:

- `arize` matched 27 times in CiteVyn. All 27 were the word **"summarize."**
- NarraTwin was believed to use RAGAS. It deliberately blocks it over an unfixed CVE — the
  opposite claim, and a better one.

Substring matches are not evidence. Confirm the token.

## Screenshots

Playwright, not headless Chrome — plain `chrome --screenshot` does not execute module JS and
captures blank pages. Serve with an explicit `text/html; charset=utf-8`; Python's
`http.server` omits the charset and renders UTF-8 as mojibake.

The home page supports `?at=<plate-id>` for direct navigation to a plate.

## Commands

```bash
npm run dev      # dev server
npm run build    # static build to dist/
npm run preview  # serve the build
```
