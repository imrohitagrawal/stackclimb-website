# P-9 — the résumé becomes evidence-linked, in place on `/cv`

Implements P-9 (`docs/OWNER-DIRECTIVES.md`) and plan phase 4.4 (`docs/plan/build-plan.md:92`):
*"Interactive résumé — evidence-linked ledger, no skill bars. Gate: every claim links to
its proof or is labelled [approximate]."* (Gate text originally said "self-reported" — a
word P-16/RCA-002 bars sitewide; owner confirmed in this session's planning the substitute
word is **"Approximate"**, matching the rest of the site, not the internal `REPORTED` taxonomy
word from `docs/evidence/README.md`.)

Owner decision, this session: **enhance `/cv` in place — no new page, no nav change.**
`/cv` already lists every claim; a separate page would duplicate `cv.js` and overlap
`/experience` (D57's own "no redundant hop" reasoning applies here too).

## Ground truth, verified by command

| Fact | Command / read | Result |
|---|---|---|
| `/cv` today | `src/pages/cv.astro` (142 lines) | Static, zero JS, print-clean per DEF-8/D31. Experience section already carries a section-level `Approximate` note (`cv.astro:60-63`, RCA-002 ruling 1). Projects section links only the project **name** to its live product (`p.href`); the `what`/`gate`/`rule` claims beneath it link nowhere |
| Employer claims (`cv.js` `experience[].points`) | `src/data/cv.js:56-125`, 6 jobs | No public evidence exists for any of these — internal, unverifiable from outside. The section-level `Approximate` note already covers every bullet under it; the gate's "or labelled" branch is already satisfied here, no change needed |
| Project claims (`cv.js` `projects[]`) | `src/data/cv.js:133-181`, 6 projects | 5 of 6 (CiteVyn, Quorum-AI, SaafSaans, NarraTwin AI, EvalAxis) map exactly, by name, to `proof.js` `capabilityRows` and its `file` field — a real, already-tracked, already-public evidence doc under `docs/evidence/projects/*.md` (confirmed: `git ls-files` shows all 5 tracked, not gitignored). The 6th, Aegis Contracts, has `gate: null, href: null, state: 'In progress — closed'` — no live claim beyond a status word, matches the existing "a row with no gate prints none" precedent (`cv.astro:95-97`), needs no link |
| Evidence files are real proof, not a promise | `docs/evidence/projects/citevyn.md` etc. | Each is capped at 200 lines, one concern per file, every claim inside carries a VERIFIED/REPORTED/UNVERIFIED/REFUTED status measured at a named commit (`docs/evidence/README.md:14-21`) |
| Repo is public | D53/D71 (`docs/STATUS.md`) | A GitHub blob link to `docs/evidence/projects/<file>.md` is a real, resolvable, third-party-inspectable link today — no new route or renderer needed |
| Banned string | `tests/proof-data.spec.js:143-153`, `tests/proof-act.spec.js` | `self-reported` (any folded form) already barred on every built page including `dist/cv.html` — this package must not need to touch that bar, only stay clear of it |
| File budget | D8 | `cv.astro` 142/250 lines, `cv.js` 210/250 lines — both have room; no new file is required |
| Existing CV gate | `tests/proof-cv.spec.js` | Covers the `/cv` ↔ act attribution partner (P-16/D87) — unrelated to project-evidence linking, must stay green unchanged |

## Clause map (row IDs)

- **P-9 (this package)** — every résumé claim links to its proof or is labelled
  `Approximate`. Acceptance: every project card on `/cv` that carries a `what`/`gate`/`rule`
  claim also carries a resolvable link to its evidence file; every project card that
  carries no gate (Aegis) is exempt, matching existing precedent; the Experience section's
  existing `Approximate` note is asserted present by a named test (it existed before this
  package but had no gate proving it — closing that gap is in scope).
- **P-16 / RCA-002** — the label word is `Approximate`, never `self-reported`, confirmed
  for this surface by the owner this session. No new instance of the barred word is
  introduced; the sitewide sweep (`proof-data.spec.js`) already covers `dist/cv.html`.
- **P-15** — link text stays plain (`Evidence` or `→ evidence`, not "verify this claim
  yourself" or other jargon); the recruiter-plain-language rule applies to new copy same
  as any other package.
- **D31 / DEF-8** — `/cv` stays a page that **prints cleanly**. A plain `<a>` per project
  card is print-safe (Chrome's print renders link text as normal text; no layout shift, no
  hover-only content). No accordion/toggle/JS-gated content is added — this package adds
  zero client JS. "Interactive" here means *hyperlinked*, not *scripted*; the plan phase
  4.4 gate text never asked for a widget, and DEF-1's zero-JS-required bar is easiest kept
  by not needing JS at all.
- **D8** — no new file; both touched files stay under 250 lines after the change (estimated
  +10 lines `cv.astro`, +6 lines `cv.js` for the new `evidence` field × 5 projects).
- **D36** — `cv.js`'s project numbers are already the counted, evidence-backed data (not
  the possibly-stale CV document); this package only adds a pointer to the proof that
  already exists, it does not change any figure.

## What ships

**`src/data/cv.js`** — each of the 5 evidence-backed projects gains one field:
```js
evidence: 'https://github.com/imrohitagrawal/designing-website/blob/main/docs/evidence/projects/citevyn.md',
```
(and the matching file for quorum-ai, saafsaans, narratwin, private/EvalAxis). Aegis
Contracts gets no `evidence` field — `null`/absent, matching its existing `gate: null`.
The URL is written out in full (not derived at build time) so a broken link is visible in
the diff and the `git ls-files` check below catches drift without a runtime fetch.

**`src/pages/cv.astro`** — inside the `projects.map` block, alongside the existing
`Gate`/`Rule` lines: a plain link, rendered only when `p.evidence` is present —
`{p.evidence && <p class="cv-gate"><a href={p.evidence} rel="noopener">Evidence</a></p>}`
— same `cv-gate` styling already used for Gate/Rule, no new CSS class needed (checked:
`.cv-gate` is a plain text-line style, an `<a>` inside it inherits link-color from the
existing `a` rules already present sitewide, no override required — confirmed by reading
`src/styles/*.css` for `.cv-gate`, no `color` override that would swallow a link).

**`tests/proof-cv.spec.js`** (extends the existing file, not a new one) — two new
assertions:
1. Every project in `cv.js` with a non-null `gate` also has a non-null `evidence` field
   pointing at a real, tracked file under `docs/evidence/projects/` (`git ls-files` check
   at test time, not a network fetch — resolvable-in-principle, not live-fetched, matching
   how `proof.js`'s existing `file`/`term` binding already works without a network call).
2. Every rendered `/cv` project card whose `cv.js` entry has `evidence` set contains an
   `<a>` whose `href` equals that value, and the Aegis card (no `gate`) renders no
   `Evidence` link — locks the exemption so it can't silently start requiring one.
3. A new assertion pins the Experience section's existing `Approximate` note is present
   and visible (was previously true but ungated — this package closes that gap as part of
   satisfying P-9's "or labelled" branch explicitly, not just by accident of unrelated copy).

**Mutations (to be committed before, watched red, exact messages recorded in the STATUS
row when built):** drop `evidence` from one project with a `gate` → red (missing-evidence
assertion) · point `evidence` at an untracked filename → red (git ls-files check) · remove
the rendered `<a>` from `cv.astro` while keeping the data field → red (render-binding
assertion) · give Aegis a fake `evidence` value → red (exemption-lock assertion, proving
the test doesn't just check "≥0 links exist") · delete the Experience `Approximate` note →
red (new presence assertion).

## Not in this package

A new `/resume` page (owner declined — enhance `/cv` in place) · a verified-only filter
(owner declined for now — expand/collapse only, see Amendments) · Education/Certifications
(genuine credential names, no measured claim) · rewording the Experience section's existing
`Approximate` note · `cv.js` figures themselves (D36 already settled their authority) · nav
(unaffected, no new route) · fixing `docs/OWNER-DIRECTIVES.md` P-14's stale claim beyond the
one line corrected in this package (see Amendments) — a fuller P-14 re-audit is separate work.

## Amendments — plan-review fan (4 lenses), this session

**Two BLOCKERs, both real, both fixed in the design above (not by patching v1 — this
section replaces v1's "What ships" mechanism, kept here as the record of why):**

1. **Missing P-row sweep (clause-mapping lens).** v1 cited only P-9/P-16/P-15/D31/D8/D36 and
   never ruled on the rest, the exact gap D79/P-15's own process fix exists to close. Full
   sweep, this session: **P-1** (evidence-section staleness) — not touched, out of scope.
   **P-2/P-4/P-5/P-6** — swept, none governs a résumé claim-evidence mechanism. **P-3/P-19/
   P-20/P-21** — hero/footer/act packages, unaffected. **P-7** — partial-honoured row about
   `/how-i-build`; unaffected, this package doesn't touch that page. **P-8** — in-progress
   items shown, not hidden; EvalAxis/Aegis's `state` text already does this, unaffected.
   **P-10/P-11** — later queue items, unaffected. **P-12** — logo process miss, unrelated.
   **P-13** — contact links as hyperlinks; this package's own new links follow the same rule
   (labelled, real `<a>`, never bare text) — same discipline, no new gate needed since
   `tests/proof-cv.spec.js` covers this page, not `contact.spec.js`. **P-14** — directly
   relevant, see finding 2 below. **P-17** — status words stay off the proof act; this
   package touches `/cv` only, unaffected. **P-18** — presentation delegated, facts
   reserved; this package's link/label choices are presentation, the claims themselves are
   unchanged, consistent with the standing rule.

2. **A better mechanism already exists and v1 never checked for it (clause-mapping lens,
   confirmed independently).** `src/data/project-pages.js` + `src/pages/projects/[slug].astro`
   already ship a polished, two-lens-plus-skeptic-verified, evidence-traced page for 4 of
   the 6 projects (P-14, `docs/OWNER-DIRECTIVES.md:78`) — `citevyn`, `quorum`, `saafsaans`,
   `narratwin` (confirmed by reading `project-pages.js`'s actual keys, not the register's
   prose). **v1's design — a raw GitHub blob link straight into
   `docs/evidence/projects/*.md` — was strictly worse on every axis a second lens then
   found independently** (evidence-link-correctness lens): the URL template used this
   local checkout's directory name (`designing-website`) instead of the real GitHub repo
   (`stackclimb-website`) and every one of the 5 links would have 404'd (verified:
   `curl` against both, 404 vs 200); two of the five target files
   (`private.md`, `quorum-ai.md`) contain internal process narrative never meant for a
   recruiter — an admission of a previously-shipped fabricated screenshot, a "presentation
   liability" note about stray files in the repo root — that would read as a liability, not
   proof, if clicked from a résumé. **Fix: link to `/projects/<slug>` instead of the raw
   evidence file.** This is site-owned, already-reviewed, recruiter-appropriate prose that
   traces to the same evidence underneath (the project page's own header comment: *"every
   line traces to `docs/evidence/projects/<name>.md`"*) — proof without exposing internal
   notes, and a short internal path instead of a long external URL (better for the print
   `::after` URL-append rule found below, too).
   **Correction found while re-verifying this, recorded here per the "corrections stay"
   rule:** `docs/OWNER-DIRECTIVES.md:78`'s P-14 row claims EvalAxis has a project page
   ("`c3233de`"), and that commit **does not exist in this repository's history**
   (`git show c3233de` → `fatal: ambiguous argument`) — `project-pages.js` has no `evalaxis`
   key. The ledger's claim was wrong; the code is right. **This package corrects that one
   line in P-14's row** (the SHA and the claim) in the same commit that discovers it, per
   AGENTS.md "if the file and a conversation disagree, the file is wrong and gets fixed."
   Consequence for this design: EvalAxis gets **no** internal-page link (route doesn't
   exist) — it falls back to the `Approximate` label instead, which is also what
   `docs/evidence/projects/private.md` itself already prescribes for EvalAxis and Aegis
   ("Neither gets an artefact panel... described and never linked") — the fallback is
   consistent with an existing site rule, not invented for this package.

3. **Awards silently left off the gate (clause-mapping + adversarial-scope lenses,
   independently).** `cv.js`'s Awards entries include "Oracle Rockstar Award — for API
   automation coverage and the drop in production issues" (restates the Experience figures
   outside that section's `Approximate` note) and "BugATAhon 2016 — regional 2nd
   runner-up" (a specific, checkable placement). Both are self-reported, unverifiable from
   outside, same category as Experience. **Fix: the Awards section gets its own
   `Approximate` note**, same wording pattern as Experience's, not a reuse of the
   Experience note's scope (they're separate `<section>`s, a shared note would need to sit
   outside both, weakening the "stated once here rather than repeated" reasoning that
   justified a single note in the first place).

4. **Print rendering wasn't actually checked before the plan asserted it was fine (voice/
   print/a11y lens).** `.cv-proj a::after` already appends `' (' attr(href) ')'` to every
   link inside a `.cv-proj` card on paper (`src/styles/cv.css:225-231`) — this is existing,
   deliberate sitewide behavior (a link is a dead end on paper unless it says where it
   goes), and it already applies to the existing project-name `href` links today, unchanged
   by this package. It also now applies to the new internal `/projects/<slug>` link — which
   prints as `Evidence (https://www.stackclimb.com/projects/citevyn)`, a short, clean
   result, not the ~90-character raw GitHub URL v1's mechanism would have produced. No CSS
   change needed; the plan text is corrected to state this accurately (verified by reading
   the actual rule) instead of asserting "no layout shift" without having read it.

5. **Link text.** Kept as **"Evidence"** (matches the existing one-word `Gate`/`Rule`
   convention on the same card, P-15-plain) rather than reusing `ProofPlate.astro`'s
   "Inspectable evidence · public code" phrase — that phrase describes the home act's
   *column*, not a single link; a single link needs a verb-adjacent label, not a restated
   tagline. `.cv-gate a` needs no new CSS: confirmed by tracing the cascade — no
   `.cv-gate a` override exists, so it inherits `.cv a` (ochre `--accent`, underlined,
   6.4–7.25:1 measured) with `:focus-visible` from `palette.css` (2px `--accent` outline,
   3px offset) — contrast and focus-visibility both already hold.

6. **Interactivity — owner decision, this session: expand/collapse per claim, native
   `<details>`, no JS required (matches DEF-1's bar and the site's existing mobile-menu
   pattern in `src/scripts/nav.js`).** Scoped to **project cards only**, not Experience
   bullets: Experience's `Approximate` disclosure is a short, load-bearing caveat that
   must stay always-visible (hiding it behind a click would be a transparency regression —
   the opposite of what P-16/RCA-002 exists to protect), so it is unchanged, still
   rendered plainly above the job list. Each **project card**'s `Gate`/`Rule`/`Evidence`
   block becomes the content of a `<details>` whose `<summary>` is the existing project
   name/state header row — collapsed by default (résumé stays scannable at a glance,
   matching "no skill bars"'s spirit of a plain, fast-read list), expanding reveals the
   full claim text plus its `Evidence` link. Degrades correctly with JS off: `<details>`
   is native, so the content is still reachable (one click, not a script-gated reveal) —
   the DEF-1 bar is "still works if JS throws on line one," not "requires no interaction
   at all," and `nav.js`'s mobile menu already establishes that a native `<details>` meets
   that bar. A no-JS visitor can still open every card; JS is optional polish only if any
   is added later (none is needed for this package — native `<details>` needs no script).

## What ships — v2, supersedes v1's mechanism above (kept for the record of what was rejected)

**`src/data/project-pages.js`**: no change — reused as-is, read-only.

**`src/data/cv.js`**: no new `evidence` field. Instead, a project's `href`-equivalent proof
route is derived at render time in `cv.astro` from a small local slug map (4 entries:
citevyn, quorum, saafsaans, narratwin) — kept in `cv.astro`, not `cv.js`, since it is
presentation routing, not a fact about the projects. EvalAxis and Aegis fall through to no
route; Aegis already renders no Gate line (`gate: null`) so nothing more is needed; EvalAxis
(`gate` present, no route) renders `Approximate` next to its Gate line instead of a link.

**`src/pages/cv.astro`**: Awards section gains one `cv-note` (Approximate, same wording
pattern as Experience's). Projects section: each `.cv-proj` becomes a `<details>` wrapping
the existing head row as `<summary>` and the `what`/`gate`/`rule` lines plus the new
Evidence link (or `Approximate` for EvalAxis) inside the disclosed body.

**`tests/proof-cv.spec.js`** (extended): every project with a `gate` renders either an
`<a>` to its real `/projects/<slug>` route (route existence checked against
`project-pages.js`'s actual keys, not a hardcoded list — so a future project page addition
is picked up automatically and a removed one fails loudly) or the literal word
`Approximate`; Aegis renders neither (exemption locked); the Awards section's new note is
present; every `<details>` is collapsed by default and its `<summary>` text matches the
project name (keyboard/AT users get an accurate control label, not "Details").

**`docs/OWNER-DIRECTIVES.md`**: P-14 row's EvalAxis claim and SHA corrected to state no
project page exists for it, in the same commit this package ships.

**Mutations (committed before, watched red, exact messages recorded when built):** an
`evidence`-route link pointed at a nonexistent slug → red (route-existence check) · the
Approximate fallback removed from EvalAxis while its `gate` stays → red (or-labelled
assertion) · Aegis given a fake route → red (exemption-lock) · Awards note deleted → red ·
a `<details>` `open` attribute added (defaults to expanded) → red (collapsed-by-default
assertion) · a `<summary>` text swapped for a generic string → red (label-accuracy check).
