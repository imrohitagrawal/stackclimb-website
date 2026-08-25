# CiteVyn

Citation-grounded question answering over official AI documentation. Answers quote their
sources verbatim; index updates reach production only through an evaluation gate.

**Measured 2026-08-11 at `df8cfc3`** (repo HEAD, committed 2026-07-22). Live at
`citevyn.stackclimb.com` — answered HTTP 200 in **7.9s**, a cold start, on 2026-08-11.

---

## VERIFIED — counted directly

| Claim | Value | Command |
|---|---|---|
| Backend test functions | **1,036** | `grep -rh 'def test_' backend/tests --include='*.py' \| wc -l` |
| Frontend Playwright tests | **125** | `grep -rh 'test(\|test.describe' frontend/tests --include='*.ts' \| wc -l` |
| Application Python | **15,246 lines** | `find backend/app -name '*.py' \| xargs wc -l` |
| Golden case files | **53** | `ls tests/golden/cases \| wc -l` |

### Golden suite — `backend/artifacts/golden_report.json`, generated 2026-07-17

**52 / 52 passed, `pass_rate` 1.0.** A red case blocks the index from reaching production.

Note the 53-vs-52 gap: 53 case files exist, 52 ran in the recorded report.

### Evaluation — `artifacts/eval_report_pg.json`, real embeddings against Postgres

Embedder: `openrouter / openai/text-embedding-3-small / dim 1536`.

| Metric | Value | Scope |
|---|---|---|
| Retrieval hit-rate | **1.0** | **26 answerable cases** — not 54 |
| Multi-hop hit-rate | **1.0** | 5 cases |
| Follow-up hit-rate | **1.0** | 3 cases |
| MRR | **1.0** | 25 ranked |
| precision@1 | **1.0** | 25 ranked |
| LLM-judge mean | **4.63 / 5** | **54 judged**, threshold 3.0 |
| Judged refusal leaks | **0** | 19 refusal cases |
| Groundedness | **1.0** | 21 fact-bearing cases |

---

## Corrections — figures that were nearly shipped wrong

| Claim | Status | Truth |
|---|---|---|
| "hit-rate 1.0 over **54** cases" | `REFUTED` | 54 is the **judge** count. Hit-rate 1.0 is over **26 answerable** cases. Conflating them inflates the scope of a real result |
| "**zero** refusal leaks" | `REFUTED` unqualified | `retrieval.refusal_leaks` is **5** of 19. The *answer* layer still refuses — `judge.refusal_leaks_judged` is 0 — so the honest phrasing is *"retrieval surfaced in-domain chunks on 5 near-miss refusal cases; the answer layer refused every one"* |

---

## Must not be claimed

- **`backend/artifacts/eval_report.json` is the stub run** — hit-rate 0.737, `judge.available:
  false`, paraphrase hit-rate 0.0 because the vector arm is deliberately dead under the stub.
  Only `artifacts/eval_report_pg.json` may be quoted.
- **The corpus is small and seeded.** Chunk keys are `claude_api#0`, `codex#0` — roughly one
  chunk per source. This is a **correctness** demonstration, not a scale one. Never claim index
  size or document counts.
- **The golden suite runs against fixtures.** `claude_api_001` returns *"Per the cited source
  [1], this is documented behavior"* citing `https://docs.example.com/claude-api`, a placeholder
  domain. The 52/52 pass rate is a real gate and safe to state; **printing an answered case's
  content would put a fabricated citation URL on the site.**
- `docs/COST_CONTROLS.md` layer 4 is marked **Partial — in-process today**; `make budget` is
  marked planned, not implemented.
- The README carries more governance narrative than the code needs. The code is better than the
  README.

---

## The hard engineering — for the panel's supporting line

**Embedder-provenance gating**, `backend/app/retrieval/hybrid.py:286`
(`_vector_arm_enabled`) and `:345` (`_active_index_stamp`).

Every `IndexVersion` row carries the `(embedding_provider, embedding_model, embedding_dim)` that
embedded it. Before the three retrieval arms fan out under `asyncio.gather`, the retriever
compares that stamp against the configured embedder. On mismatch it **degrades the vector arm
to zero hits** and logs both triples, rather than serving rankings computed in the wrong
embedding space. The same predicate stops that degraded answer entering the cache.

Why it matters, from the docstring: *"The dimension guard alone does not catch a same-dim
provider/model swap without re-ingest (e.g. `stub` → `gemini`, both 1536)."* Cosine distance
across two embedding spaces is meaningless, and the LLM then cites confidently-wrong sources —
a silent-correctness failure a dimension check cannot see.

Three details showing judgement: unknown provenance is **allow**, not deny, so the gate ships
without breaking legacy indexes; two simultaneously-active rows return `None` with a WARNING
rather than an arbitrary pick; and the lookup is awaited **before** the gather to keep it off
the shared `AsyncSession` while the arms run concurrently.

**Runner-up:** `services/index_versions.py:267 promote_version()` — one transaction, `SELECT …
FOR UPDATE`, an evaluation gate requiring the newest COMPLETED run to meet
`index_promotion_min_pass_rate`, and an `AuditEvent` written on **both** the clean and forced
paths carrying `force`, `measured_pass_rate`, `threshold` and `evaluation_run_id`.

---

## The judge panel — measured 2026-08-14 at `df8cfc3` (AI-architect lens, verified by command)

Carried on the project page's plate 1 since package B. Every clause re-derivable:

| Claim | Evidence |
|---|---|
| Three rubric framings, ensemble by wording not sampling | `backend/tests/eval/judge.py:86-102` (`_STANDARD_FRAMINGS`), `:116` (`_DEFAULT_PANEL_SIZE = 3`) |
| Temperature 0, reproducible | `judge.py:60` — "the gate never flakes run-to-run" |
| Median over an odd panel | `judge.py:197-213` (even N decremented), `:313-317` |
| Skeptic applied as a floor, `min()`, not a fourth vote | `judge.py:104-114`, `:320` (`final = min(median, adv_score)`), docstring `:22-24`: a lone low vote can never move a median |
| Coverage gate: < 90% usable scores fails the run | `backend/tests/eval/thresholds.py:33` (`MIN_JUDGE_COVERAGE = 0.9`), `backend/tests/eval/runner.py:437-445` |
| Veto proved by test | `backend/tests/test_eval_judge_robustness.py:202,211,218` — veto bites below a unanimous 5; the skeptic can never pull a score up |
| The recorded 4.63/54 run used the panel code | `git log -1 -- artifacts/eval_report_pg.json` → `112c3ff` (07-20); panel landed `be2d676` (07-16) |

**UNVERIFIED, do not claim:** the panel size N of the recorded 4.63 run — CI pins the panel
to 1 to bound spend (`judge.py:34`) and the report summary omits N. The check that settles it:
read `standard_scores` length from a fresh judged run's per-case output. Site copy therefore
describes the mechanism and never asserts N for that run.

## Panel asset

`src/assets/projects/citevyn-demo.webp` — from
`frontend/tests/visual.spec.ts-snapshots/demo-light-chromium-darwin.png`, a committed Playwright
visual baseline. Shows a real answer with **two real documentation citations**
(`docs.claude.com/en/docs/claude-code/overview`, `/quickstart`) and the intent router visible in
the left rail as `USAGE` / `EXACT LOOKUP` / `HOW-TO` / `OUT OF SCOPE`.

Unlike the golden-suite fixtures, these citation URLs are real. Verified by reading the image.

`src/assets/projects/citevyn-crop.webp` — the answer with its two citations, 712×296, cut from
the capture above. **Re-cut 2026-08-26 (DEF-70):** it was a 790×380 phone crop served below
700px; the home plate now shows it at every width (`homeCrop`), because the full capture rendered
at 0.41 of its size in the desktop column — a 16px line at ~6.6px. The left rail with the intent
router is out of the crop's frame and stays on the project page, which shows the full capture.
