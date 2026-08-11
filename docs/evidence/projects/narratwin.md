# NarraTwin AI

Grounded multilingual walkthrough generation with citations, claim evaluation, consent checks
and release gates that run before anything is generated.

**Audited 2026-08-11.** Two trees are in play and it matters which a number came from:

| Tree | HEAD | Role |
|---|---|---|
| `narratwin-ai/narratwin-ai` | `2ce5731` (08-02) | main worktree; the auditor's reference |
| `narratwin-ai/narratwin-ai-issue-415` | `639aa2c` (08-11) | current work; measured here for code counts |
| `narratwin-ai-issue-368-google-runtime` | — | **deleted 08-11.** Held the only copies of two reports |

---

## VERIFIED — measured directly, 2026-08-11

Counted at `639aa2c`, branch `governance-415-pr-body-live-state`.

| Claim | Value | Command |
|---|---|---|
| Backend Python | **25,606 lines** | `find backend -name '*.py' -not -path '*__pycache__*' \| xargs wc -l` |
| Test functions | **1,668** | `grep -rh 'def test_' tests --include='*.py' \| wc -l` |
| Test files | **82** | `find tests -name 'test_*.py' \| wc -l` |
| Supported languages | **25** | `reports/checkpoint3-multilingual/full-project-correctness-report.json` → `supportedLanguages` |
| Surface-parity results | **25** | same file → `surfaceParity` |
| Script classes | **6** | same file → `languageClassCoverage` |
| Fixture pin | `sha256:b1d7b95504703b9a…` | same file → `fixtureHash` |
| Expected-output pin | `sha256:c5aefa275d715b88…` | same file → `expectedOutputHash` |

`surfaceParity` proves, per language, that the API transcript, stored output, subtitles,
translated script and voice manifest all agree. **This is the strongest NarraTwin claim the
site can currently stand behind**, because the file that carries it is on disk and re-readable.

---

## VERIFIED AT AN OLDER COMMIT — true, but does not describe current HEAD

`docs/EVAL_REPORT.md` is **committed**, added at `7400241`. Quoted verbatim by an independent
read-only audit on 2026-08-11:

| Metric | Value |
|---|---|
| Passed | YES |
| Checks | **41/41 passed** |
| faithfulness | **1.0** |
| answerRelevancy | **1.0** |
| contextPrecision | **1.0** |
| contextRecall | **1.0** |

**The caveat travels with the number, always.** The auditor's words: *"It contains no tested
commit SHA. It predates current HEAD and therefore does not establish that current HEAD
passes."* If this reaches the site it is labelled with the commit it was measured at, never
presented as current.

Harness: `bash scripts/ci/eval-smoke.sh` → `backend/app/eval/runner.py`, fixtures at
`evals/smoke/stage5_grounded_script_dataset.json`. Needs no API key, no paid call, no database —
FastAPI `TestClient` and local mock providers. The JSON result
(`reports/eval-smoke/stage5-eval-smoke-report.json`) is **gitignored and has never been
committed**; `git log --all` on that path returns no commits.

---

## REFUTED — figures I nearly shipped

| Claim | Status | Why |
|---|---|---|
| answerRelevancy **0.903** | `REFUTED` | The committed report says **1.0** |
| contextRecall **0.75** | `REFUTED` | The committed report says **1.0** |

Both came from a research subagent that read
`reports/eval-smoke/stage5-eval-smoke-report.json` while the `issue-368-google-runtime`
worktree still existed. That file is now gone and unrecoverable, so the figures cannot be
re-checked.

**The most likely explanation is not fabrication but two different runs** — a newer JSON in the
deleted worktree against the older committed markdown. That is precisely why it is dangerous:
both were plausible, both were "read from a file", and only one survives to be verified.

**The process lesson, which is the real finding:** an inherited claim is assumed until
re-measured, even when the source is your own agent and even when it cited a path. The owner
caught this by refusing to let a prompt to another session quote the expected values — which
would have invited that session to reproduce numbers it had been handed rather than report what
it found.

---

## UNVERIFIED — must not appear on the site

| Claim | State |
|---|---|
| Lighthouse Performance / Accessibility / SEO **100 / 100 / 100**, Best Practices 96 | Harness exists (`bash scripts/ci/frontend-lighthouse.sh` → `frontend/scripts/run-lighthouse.mjs`). **No committed result anywhere.** `git log --all` on `reports/lighthouse/stage8-lighthouse.json` returns no commits; the path is gitignored. No surviving local output, no matching CI artifact |
| FCP 0.9s · LCP 1.1s · TBT 0ms · CLS 0 | Same source, same status |
| A styled-frontend screenshot | Harness exists (`frontend/tests/real-stack.spec.ts`, `page.screenshot({fullPage:true})`). **No committed PNG/JPEG/WebP anywhere.** Needs Docker plus Postgres and Redis via Compose to reproduce |

The auditor also flagged that Lighthouse **is not deterministic** — browser, machine load,
network and Lighthouse version all move the numbers, and the repo records no measured variance.
So even once produced, a Lighthouse score ships with its run conditions attached or not at all.

**One recovery lead:** a CI `eval-smoke-report` artifact exists for remote SHA `639aa2cf…`,
expiring **2026-08-18**. It is not for the main tree's HEAD, but it is a real run of the current
branch and worth retrieving before it expires.

---

## Planned — the tasks these gaps create

1. **Commit the eval-smoke JSON**, or record in the repo why it stays ignored. Its absence is
   why the strongest numbers are unverifiable.
2. **Run Lighthouse against the styled Next.js frontend and commit the result.** The previous
   run's embedded `fullPageScreenshot` showed unstyled HTML with bare form controls — no CSS —
   which means it audited the raw harness, not the product.
3. **Commit one styled-frontend screenshot.** Until then the site uses an owner-supplied
   interface design, captioned as a design and not a running capture (D63).
4. **Stamp a tested commit SHA into `docs/EVAL_REPORT.md`** so a future reader can tell what it
   describes.
5. **Retrieve the CI artifact for `639aa2cf…` before 2026-08-18.**

---

## What the site may say today

Only the VERIFIED block, plus the eval figures **with their commit stamp and the "predates
current HEAD" caveat attached**. Nothing from UNVERIFIED. No Lighthouse score. No throughput
claim — the load test on record is a healthz smoke test, 178 requests against one endpoint.

`docs/ARCHITECTURE.md` opens *"Implementation status: blocked until Stage 4 gate approval."*
A reader who starts there concludes nothing shipped, while `tts_provider.py` carries a
crash-safe spend ledger with a `BILLABLE_UNKNOWN` state and `google_tts_runtime.py` re-verifies
`getpeername()` against a validated IP before the TLS wrap, closing a DNS-rebinding TOCTOU
window. The doc undersells the code badly. Flagged to the owner, not fixed here.
