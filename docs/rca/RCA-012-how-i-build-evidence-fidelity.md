# RCA-012 — `/how-i-build`'s claims drift from the repositories they cite

**Status: written before the fix, per AGENTS.md's order, on 2026-08-28.**

D153 (the three-page critique) flagged this as P2. Reproduced fresh from a clean `main`
(`b6a962c`), independent of the critique's own numbers, per AGENTS.md's "execution is the source
of truth." One defect below (the evidence file's own quote fidelity) was found by this
reproduction and is not in D153's text.

## What happened

`/how-i-build` (`src/pages/how-i-build.astro`) makes six claims about the owner's engineering
practice, each meant to trace to a `VERIFIED` line in `docs/evidence/practice/`. Five of the six
have drifted from what a fresh read of the source repositories and evidence file shows:

1. **Skill count stale.** The page says "112 authored skill directories." A fresh count is 113.
2. **`.github` mischaracterized as a skill.** The page's `#published-skills` plate says "Two of
   the skills above are public repositories" and then lists `project-doc-skills` (a real skill
   repo — confirmed, `.agents/skills/*/SKILL.md` present) and `.github` (confirmed: no
   `SKILL.md` anywhere in the repo; it holds `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`,
   `PULL_REQUEST_TEMPLATE.md`, `SECURITY.md` — contribution and security templates, not a skill).
3. **OTel/Prometheus count wrong.** The page says "across three systems." The evidence file that
   is supposed to back this claim (`docs/evidence/practice/evals-observability.md:30-37`) names
   exactly **two**: narratwin-ai and evalaxis-ai. The third system it discusses for the same
   paragraph, saaf-saans, explicitly uses a *different* stack — Elasticsearch/Kibana, not
   OpenTelemetry/Prometheus. (Checked and ruled out as a red herring: `git grep -li opentelemetry`
   also hits quorum-ai and citevyn, but only as prose mentions in docs, not as claims this
   page's paragraph is bound to — the evidence file's own text is the ground truth for what "three
   systems" was supposed to mean, and it names two.)
4. **CiteVyn's state drifted between pages.** `src/data/projects.js:23` (feeds `/` and
   `/projects/citevyn`) says `'Live — cold-starts'`. `src/data/cv.js:143` (feeds `/cv`) says
   `'Live'` — no qualifier. Two different claims about the same system's availability, undisclosed
   on the page that has room to carry it.
5. **The artefact quote fuses non-adjacent source lines with 12 words dropped and no ellipsis.**
   `how-i-build.astro`'s `.artefact` blockquote and its own evidence file
   (`docs/evidence/practice/failure-driven.md`) both do this — see the measurement below. The page
   quotes two sentences as if they were the complete honest-scope statement; the real file states
   two independent checks and explicitly names its own blind spot (a PROXY that "cannot see a
   Deploy run that reported success while production did not actually roll") and the incident that
   proves why the second check exists (34m31s of undetected drift on 2026-08-07). Dropping that is
   dropping the site's own thesis from its own best example of it.
6. **No footer link on the artefact quote.** The blockquote cites `deploy-drift-watchdog.yml,
   quorum-ai` as plain text with no link, unlike other evidence citations on the site.

The sixth item (not in D153's plan, found by this reproduction) is that **the evidence file itself
is not verbatim either** — see the measurement below. Fixing only the page while leaving its cited
source equally wrong would leave the "ground truth" file carrying the same defect.

## The measurement

Reproduced fresh, not copied from `docs/plan/critique-three-pages.md`:

```
$ grep -n "112" src/pages/how-i-build.astro
33:            112 <span class="band-term">authored skill</span> directories, including skills

$ ls -d ~/Projects/quorum-ai/.agents/skills/*/ | wc -l
     113

$ find ~/Projects/dot-github -iname "SKILL.md"
(no output — confirmed: not a skill repo)

$ grep -n "OpenTelemetry" docs/evidence/practice/evals-observability.md
30:`VERIFIED` — narratwin-ai emits OpenTelemetry traces and Prometheus counters/histograms
33:"secret" **before it leaves the process**. evalaxis-ai runs the same OpenTelemetry/Prometheus
    (saaf-saans, same paragraph, uses Elasticsearch/Kibana instead — two OTel/Prometheus systems
    named, not three)

$ grep -n "state:" src/data/projects.js | grep -i citevyn -A1 -B1
23:    state: 'Live — cold-starts',   # feeds / and /projects/citevyn
$ grep -n "state:" src/data/cv.js | head -2
143:    state: 'Live',                # feeds /cv — no cold-starts qualifier
```

Quote fidelity, compared word-for-word against
`quorum-ai/.github/workflows/deploy-drift-watchdog.yml` (`97827bb`, 2026-08-28):

Real source (contiguous, question 1 of "WHAT IT CHECKS"):
```
WHAT IT CHECKS (honest scope), two independent questions:
  1. Does main HEAD have a SUCCESSFUL "Deploy to Fly.io" run — the deploy JOB,
     not a `/health` 200 (per the deploy-job-skip-vs-health lesson)? This is a
     PROXY: it cannot see a Deploy run that reported success while production
     did not actually roll, and it does not track an out-of-band local
     `flyctl deploy` (if one happened it re-triggers a pipeline that just
     redeploys the same code — idempotent, harmless).
  2. Does `/status.build_sha` actually EQUAL main's tip? [...] This is the
     direct question, and the only one that catches a merge which triggered
     no workflow at all — on 2026-08-07 that left production 34m31s behind
     while every passive probe stayed green.
```

`docs/evidence/practice/failure-driven.md:11-13` (current):
```
"WHAT IT CHECKS (honest scope): whether main HEAD has a SUCCESSFUL 'Deploy to Fly.io' run — the
deploy JOB, not a `/health` 200 (per the deploy-job-skip-vs-health lesson). It does NOT track an
out-of-band local `flyctl deploy`."
```
This paraphrases "Does main HEAD have..." into "whether main HEAD has...", drops the entire PROXY
sentence and the idempotent/harmless parenthetical, and never marks the elision — presented as a
complete, verbatim quote (`>` blockquote styling) when it is a fused paraphrase.

`how-i-build.astro`'s rendered artefact panel (current):
```
"It fixes the failure mode we hit on #54: main got a new commit but no
deploy fired, leaving prod stale with no one watching."
"WHAT IT CHECKS (honest scope): whether main HEAD has a SUCCESSFUL
'Deploy to Fly.io' run — the deploy JOB, not a /health 200."
```
Drops the parenthetical `(a dropped Actions event / skipped-or-failed deploy gate / a flake)` from
sentence 1 (present in the evidence file, absent on the page — a second, independent drift), and
the PROXY/34m31s sentences from sentence 2. 12 words dropped from sentence 1 alone, no ellipsis
anywhere.

## Why nothing caught it

`tests/how-i-build.spec.js`'s quote check (lines 84-89) only asserts two short substrings are
*contained* in the artefact text — `'main got a new commit but no deploy fired'` and `'the deploy
JOB'` — both of which survive the fused, truncated version. It proves the quote is not fabricated.
It never asserted the quote was complete, and it checks the *page* against the *evidence file*,
never the evidence file against the real repository — so a paraphrase baked into the evidence file
itself passes forever, because the gate's ground truth is the same file that drifted.

The skill count, `.github` characterization, OTel/Prometheus count, and CiteVyn state are all plain
prose with no gate at all — nothing regenerates them when the cited repositories change or when a
second page (`/cv`) states the same fact differently.

## Where it was introduced

- Skill count: written at some count that has since grown (113 skills now exist; no test pins the
  number, so it silently ages every time a new skill is authored).
- `.github` as a "skill": written in the `#published-skills` plate without checking whether that
  repo actually holds a `SKILL.md`, conflating "a repository this site links to" with "a skill."
- OTel/Prometheus "three systems": written before, or without cross-checking against,
  `evals-observability.md`'s own two-system claim for that exact paragraph.
- CiteVyn state drift: `/cv`'s `cv.js` and `/`'s `projects.js` maintain the same fact in two
  separate data files with no shared source, and only one carries the `cold-starts` qualifier.
- Quote fusion: introduced when the artefact panel and its evidence-file citation were first
  written, quoting from memory or a partial read of the workflow file's comment block rather than
  the file directly, and never re-diffed against the source since.

## Where it was caught

Not by any gate. By D153's critique reading the actual source repositories and evidence files
rather than trusting that the page's own claims matched them — and by this RCA's independent
reproduction, which additionally found the evidence file itself (not just the page) fails its own
verbatim-quote standard.

## Cost

`/how-i-build` exists to prove the owner's practice by citing real artifacts, not by asserting
competence. A stale count, a mischaracterized repo, a wrong system count, an undisclosed
availability difference between two pages describing the same system, and a quote that silently
drops the exact sentence demonstrating the site's own "systems that disclose their limits" thesis
all point the same direction: the page's claims are not currently trustworthy evidence, which is
the one thing this page cannot afford to be wrong about.

## The fix

1. `how-i-build.astro:33` — `112` → `113`.
2. `how-i-build.astro:108-135` (`#published-skills` plate) — drop `.github` from the "Two of the
   skills above are public repositories" list (it becomes one: `project-doc-skills`), and reword
   the lead sentence to singular. `.github` can still be linked elsewhere on the page as what it
   actually is (templates), or dropped — decided during implementation, not a claims question.
3. `how-i-build.astro:96` — "across three systems" → "across two systems" (narratwin-ai,
   evalaxis-ai), matching `evals-observability.md`.
4. `src/data/cv.js:143` — CiteVyn's `/cv` state gains the same `cold-starts` qualifier
   `projects.js:23` already carries, so the same system reads the same way everywhere it appears
   (unless deriving `/cv`'s state from `projects.js` directly is the smaller, safer fix — decided
   during implementation).
5. `docs/evidence/practice/failure-driven.md` — rewrite the second blockquote to be genuinely
   verbatim: either quote the full two-question passage, or quote a real contiguous span with `[...]`
   marking any elision, never a silent fusion.
6. `how-i-build.astro`'s `.artefact` panel — requote to include the PROXY sentence and the
   34m31s incident line (the plan's own recommended expansion, now verified against the real
   source), restore the dropped parenthetical in sentence 1, and add a footer link to the real
   file at a pinned SHA. **Contrast constraint, checked**: `--ochre` (`#c99b3f`) against `--lit`
   (`#f4efe4`) computes to roughly 2.2:1, well under WCAG AA's 4.5:1 floor for normal text — the
   link must use `--ink` (already the panel's own text color) with an underline, not ochre.

**Gate.** Extend `tests/how-i-build.spec.js`:
- Bind the skill count as a number derived from `docs/evidence/practice/skill-library.md`'s own
  cited count (or the literal repo count if that evidence file already states one), not a
  hand-typed digit in the test.
- Assert `.github` does not appear inside the "skills" framing (or is simply absent from that
  list, if dropped).
- Assert "two systems" / the two named systems, matching `evals-observability.md`.
- Assert the artefact panel contains the PROXY sentence and the 34m31s clause, and that
  `docs/evidence/practice/failure-driven.md`'s own blockquote is checked as a real substring of the
  actual `quorum-ai` workflow file content (fetched or pinned locally), not just checked for length.
- Add or extend a CiteVyn-state-parity test comparing `projects.js` and `cv.js`'s state strings for
  the same slug — CiteVyn today, generalizable to any slug appearing in both files.

**WHICH CHANGE TURNS EACH RED:**
- Revert `113` → `112` → the skill-count assertion fails (once it derives the number rather than
  hand-typing it, reverting the *source* count would also flip it — the point of deriving it).
- Put `.github` back in the skills list → the new assertion fails.
- Revert "two systems" → "three systems" → the systems-count assertion fails.
- Revert `cv.js`'s CiteVyn state to plain `'Live'` → the parity test fails.
- Remove the PROXY sentence or the 34m31s clause from the artefact panel → the expanded quote
  assertions fail (reproduces this RCA's measurement).
- Revert `failure-driven.md`'s blockquote to the fused paraphrase → the verbatim-substring check
  against the real workflow file fails.

## Conflicts checked against settled directives

Checked P-25, P-26, D30, D31, D38, DEF-52, D123 (the settled items this loop's instructions name).
None govern anything this package touches — no copy on `/how-i-build` is about approximate
disclaimers, career-ledger scope, theming, the CV format, phone numbers, email obfuscation, or
impeccable-tree builds. **No conflict found.**

## Baseline impact

Expanding the artefact quote (item 6) and shortening/reflowing the skills list (item 2) both change
rendered height/wrap on `/how-i-build`, which `tests/geometry.spec.js` covers (confirmed via
`tests/lib/routes.mjs`'s `siteRoutes()`, which includes `/how-i-build`). This will need the
CI-dispatch geometry-baseline regeneration described in `docs/HANDOFF.md` and used for P1 —
budgeted into this package's plan, not discovered after the gate goes red.
`tests/visual-baselines.spec.js` does **not** cover `/how-i-build` (confirmed: it clips only the
home page's nav band and plate boundaries), so no visual-baseline regeneration is expected.
