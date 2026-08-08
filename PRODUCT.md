# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: **Astro**.

The owner left the choice to me. The site is content-shaped, not app-shaped: content collections
handle the writing section and case study pages as files that grow over time without a CMS, pages
ship as static HTML with near-zero JavaScript by default, and interactivity is added per-component
where a specific piece of work needs it. That keeps load and SEO strong for an audience arriving
cold from a link, and keeps maintenance cheap for a solo owner. Next.js would add app-framework
weight for routing and rendering this site does not need; hand-written static HTML would make the
writing and case study sections progressively painful as they accumulate.

Offered and delegated, not assumed.

## Users

**Primary:** hiring managers, recruiters, and senior engineers evaluating Rohit for
**senior/principal roles in Forward-Deployed AI, AI Platform Engineering, and LLMOps / AI
Reliability** — and closely aligned roles in AI Quality & Test Engineering, AI/ML SDET and Test
Architecture, and AI Platform & DevOps.

They arrive cold — from a résumé, LinkedIn, a GitHub profile, or a referral — with limited time
and several tabs open. They decide quickly whether the work is worth a longer look. A material
sub-question they will ask: *is the move from 14 years of distributed systems into applied AI
real, or aspirational?*

**Secondary:** engineers who reach the site through a linked project or article.

## Product Purpose

The personal site of **Rohit Agrawal**, a principal-level engineer with 14+ years across
distributed systems, cloud platforms, CI/CD, observability, and production reliability, now
building independent, inspectable AI systems.

Success is a reader who understands the work well enough to start a conversation. Not traffic,
not time on page.

## Positioning

**AI systems that show their work and refuse to fake it.**

This is not a claim to be written — it is the observable pattern across every repository, and the
site's job is to make it legible. Each system is built around citation, provenance, disclosed
uncertainty, explicit refusal, labelled degraded modes, and evaluation gates that can block a
release:

- CiteVyn treats refusal as a feature, not a failure; index promotion is evaluation-gated.
- Quorum-AI returns disagreement and uncertainty as first-class output fields, approves cost
  before executing, and discloses when a slot fell back to simulation.
- SaafSaans labels whether a reading is live, deterministic, or sample; its Hindi translation is
  gated behind a banner stating no Hindi speaker has reviewed it.
- NarraTwin gates generation behind claim evaluation, consent checks, and release readiness.
- project-doc-skills ships deterministic builds and verification gates.
- EvalAxis blocks CI on a quality regression.

The discipline extends to how he describes his own work: the GitHub profile states that
"current deployment, provider, index, users, and adoption are not asserted." He labels what he
has not proven. **This honesty is the differentiator, and the site must not violate it.**

## Operating Context

- **Domain: `stackclimb.com`.** The apex currently serves nothing — verified 2026-08-04,
  connection fails in ~0.04s. This site takes the apex.
- Projects are served from subdomains of the same domain. Verified 2026-08-04:
  - `quorum.stackclimb.com` — HTTP 200, 0.96s
  - `citevyn.stackclimb.com` — HTTP 200, 6.7s (cold start)
  - `saafsaans.stackclimb.com` — no response within 45s. Its README documents a 256 MB Fly.io
    machine in Mumbai scaled to zero when idle, so a slow first request is expected behavior;
    **the deployment's current health is unverified** and must be re-checked before the site
    links to it as live.
- Source is public on GitHub under `imrohitagrawal`.
- Visitors commonly arrive on a deep link rather than the home page, so every page must work as
  an entry point.

## Capabilities and Constraints

Confirmed site structure: `home`, `work`, `writing`, `about`, `contact`, and one case study page
per project.

**Confirmed home page decisions (interview, this session):**

- Thesis-led. The POV is stated first; the 14-year track record is the credential line directly
  under it; the running systems follow as proof.
- The end of the Oracle role (April 2026) and the deliberate focused period since are named
  plainly on the home page, not hidden on About.
- Home shows the four public systems, plus EvalAxis and aegis-contracts named as private work
  with a one-line description and no link.

**Undecided — do not invent:**

- Whether any writing/articles exist yet. No article content has been located.
- Résumé/CV availability and whether it is downloadable.
- Contact mechanism: form, `mailto:`, or scheduling link.
- Where the site is hosted and how the apex is wired.

## Brand Commitments

- **Name:** Rohit Agrawal. **GitHub:** `imrohitagrawal`.
  **LinkedIn:** `linkedin.com/in/rohitagrawal14`. **Email:** `rohit.ra.agrawal@gmail.com`.
- **Location:** Bengaluru, India; open to global relocation and international travel.
- **Stated engineering principle, in his words:** "Trust before deployment. Validate production
  reliability continuously. Shift left by default; shift right by design."
- **Voice discipline (binding):** state what is proven, label what is not. The existing profile
  README explicitly disclaims deployment, provider, users, and adoption. The site inherits this.
  No unearned superlatives, no implied adoption, no invented metrics.
- No logo, fixed typeface, or palette exists. Visual identity is open.

## Evidence on Hand

Substantial and real. Superseding the earlier "nothing yet" answer, which described unwritten
site copy rather than absent material.

**Four public systems** (descriptions and topics read from the repositories):

1. **CiteVyn** — citation-grounded Q&A over official AI documentation. FastAPI, Postgres 16 +
   pgvector, Redis, Caddy, Docker. README reports 361 tests passing, a 50/50 golden evaluation
   suite as a hard release gate, pyright strict, and Playwright E2E. Live.
2. **Quorum-AI** — one question against four LLMs in parallel, two rounds of mutual critique,
   then a five-field synthesis: consensus, disagreement, source support, uncertainty,
   recommendation. Pre-run cost approval; results are ephemeral by design. Live. 2 stars.
3. **SaafSaans** — Delhi/NCR air quality companion scoring personal rather than city risk across
   21 stations, with 43 seeded advisories and grounded Q&A. Four views including a System view
   where the app audits itself (latency, fallback rates, token spend, blocked prompt-injection
   attempts). Documented design concept: *"the sky is the interface."* 1 star.
4. **NarraTwin AI** — grounded multilingual walkthrough generation with citations, claim
   evaluation, consent controls, and release governance. **Documented state: local/mock Phase 1
   under No-Go; no hosted deployment, no provider-backed media, no public distribution.**

**Also public:** `project-doc-skills` (reusable AI documentation skills, deterministic builds,
verification gates) and `.github` (shared workflows and AI review config across all repos).

**Private:** `evalaxis` (evaluate LLM/RAG/agent changes with evidence; block CI on a quality
regression) and `aegis-contracts`.

**Existing assets:**

- `~/Projects/imrohitagrawal/README.md` — a complete, well-written GitHub profile README. It is
  the strongest existing draft of the site's content and the best source for voice.
- `~/Projects/imrohitagrawal/assets/engineering-lifecycle-{light,dark,mobile-light,mobile-dark}.svg`
  — a four-gate delivery model diagram (Understand → Design & Deliver → Assure & Ship → Run &
  Improve, with trust/provenance/evaluation/governance across every stage, plus a feedback loop),
  already built responsive and theme-aware.
- `~/Projects/saaf-saans/docs/screenshots/` — real product screenshots (light, dark, city pulse,
  system/security, Hindi).
- Per-project architecture and decision documents: CiteVyn `docs/ARCHITECTURE.md`, Quorum-AI
  `docs/20-architecture.md`, SaafSaans `docs/CASE-STUDY.md`, NarraTwin
  `docs/RELEASE_READINESS_REVIEW.md`.

**Career facts** (self-reported, not independently verified): Oracle Principal Member of Technical
Staff, April 2019 – April 2026; led and mentored 11+ engineers; prior experience across Amazon,
LimeRoad, Mobileum, Snapdeal, and Subex.

**Corrected 2026-08-09 against the authoritative CV.** This line previously read *"MTTD reduced
~35%, release cycle time reduced ~25%"*, taken from the profile README. `Rohit_V3` — which D36
makes authoritative — **never uses the term MTTD.** Its two claims are:

- *"reducing root-cause analysis time by 35%"* — time to **diagnose**, not time to **detect**.
  MTTD is a different metric and the stronger-sounding one.
- *"reducing release validation time by 25%"* — validation is a **component** of cycle time,
  not cycle time itself.

Both restatements made the claim larger than its source. Four planning documents had inherited
them. Use the CV's own words, labelled self-reported. See `docs/positioning-phase0.md`.

**Absences future work must not fill:** no testimonials, no named users or customers, no adoption
or traffic numbers, no press. None may be fabricated.

## Product Principles

1. **The work is the argument.** Prefer a reachable, running thing over a description of one.
   Where a system is live on a subdomain or open on GitHub, that is the primary evidence and
   belongs one click away, not buried in a case study footer.
2. **Practice the thesis, don't just state it.** The portfolio is about provenance, disclosed
   uncertainty, and honest degraded modes. The site must hold itself to that standard — label
   NarraTwin's No-Go state, disclose a cold-starting instance, never assert unproven adoption.
   A site that overclaims would refute its own subject matter.
3. **Built for a two-minute skim, rewarded on a ten-minute read.** The visitor is scanning
   candidates under time pressure. Answer "who is this and is the AI pivot real" before offering
   any depth.
4. **No dead ends.** Every page — including a deep-linked case study or
   article reached cold — offers a clear way to make contact.
5. **The site is itself a work sample.** The audience is technical and evaluates implementation
   quality alongside content. For a candidate selling AI *reliability*, performance, correctness,
   and accessibility in the build are part of the argument, not overhead on it.

## Accessibility & Inclusion

Accessibility is a demonstrated commitment in the existing work, not merely a baseline: SaafSaans
carries `accessibility` as a repository topic, ships a plain-language Guide explaining every
number and term, and gates its unreviewed Hindi translation behind an explicit banner. The site
should meet WCAG 2.1 AA and treat that as part of the portfolio's argument.
