# Private systems — EvalAxis, Aegis Contracts

Both are private repositories. **Neither gets an artefact panel** — D61 is explicit that a
system without a real artefact gets no panel, never a placeholder. They ship as prose cards,
described and never linked.

**Audited 2026-08-11.**

---

## EvalAxis

A release gate for AI change: evaluates LLM, RAG and agent behaviour against a committed
baseline and blocks CI when a metric regresses.

Tree: `~/Projects/evalaxis/evalaxis-ai` — note the nesting; the outer `evalaxis/` directory is
not itself a repository.

### VERIFIED — counted directly at `c3233de` (2026-07-27, `main`)

| Claim | Value | Command |
|---|---|---|
| Application Python | **13,769 lines** | `find . -name '*.py'` excluding `.git`, `.venv`, `node_modules`, `__pycache__`, then `wc -l` |
| Test functions | **388** | `grep -rh 'def test_' . --include='*.py'` excluding `.venv` |

### CORRECTED at the same sha — package C re-audit, 2026-08-14

Two independent read-only lenses plus a skeptic re-derived the table above on a `git archive`
of `c3233de` and found the line count wrong **as a statement about the repository**:

- **12,978 Python lines is the committed figure** (129 files). The 13,769 above reproduces
  only in a working tree carrying two gitignored scripts totalling 791 lines (364 + 427)
  that the repository does not hold. The label "Application Python" was also wrong for
  either number: **6,354 of the 12,978 lines are under `tests/`**. Site figure corrected
  to 12,978 in the same commit.
- **388 test functions confirmed** — reproduces exactly. (`--collect-only` gives 426 after
  parametrisation; different metric, never conflated — D79's retraction stands.)
- **Gate semantics, precisely:** the regression gate's two tests are **alternatives — either
  fires**. A metric falling more than 5 points absolute fails outright; smaller dips fail
  only when a paired bootstrap 95% confidence interval (1,000 resamples, seed pinned to 42)
  sits entirely below zero. `regression.py:31,35-42,143,169-170`; exit 1 via `gha/action.yml`
  and `cli/main.py:131`. Copy must never join them with "and".
- **The judge is itself on trial, and the repo discarded its own first result** — calibration
  compares judge scores to human labels (kappa, PABAK, Spearman, MAE; undefined cases return
  `None`, rendered as "NA with a reason", never zero — `calibration/agreement.py:1-21`), and
  ADRs 0015/0017 record the first calibration run as illustrative-only (AI-seeded labels,
  seven model fingerprints) whose κ ≈ 0.56 *"must not be quoted as the differentiator"*.
- **The suite physically cannot spend money** — `--disable-socket` in `pyproject.toml:234`,
  with `tests/test_socket_guard.py` existing solely to fail if the guard is removed; CI's
  default judge is a deterministic fake stamped `model_id='fake'`.
- **A cached score can never come from the wrong judge** — the cache key is a SHA-256 of the
  8-tuple (prompt, response, contexts, rubric, model, model version, temperature, seed)
  (`judge/cache.py:1-16`), so a rubric edit or model upgrade silently misses instead of
  serving a stale verdict.

Repository contains `ARCHITECTURE.md`, `migrations/`, `alembic.ini`, a `dashboard/`, `gha/`,
and `docker-compose.obs.yml` — a real service with schema migrations, a UI and an observability
stack, not a sketch.

### Correction to how the site currently presents it

The live site and the current mockup describe EvalAxis as *"private · pre-1.0"* with `Works
now: Baseline scoring, CI block on regression`. The **`pre-1.0`** label is `UNVERIFIED` — it did
not come from the repository. It entered via the owner's supplied mockup and was carried
forward.

`index.astro` states its state as `In progress · closed`, which **is** the site's own recorded
wording and is safe. Use that.

**The site materially understates this project.** 13,769 lines with migrations, a dashboard and
an observability stack is not "named, not demonstrated". The constraint is that it is private —
not that it is thin.

### Not to be claimed

- Public availability, adoption, any release date, or a 1.0 status.
- Any measured regression-detection rate. No evaluation artifact has been read from this repo.
- Anything about the dashboard's appearance. It has not been run or captured.

### Supplementary audit, 2026-09-01 — the five metrics, the judge, and the CI action

For the same `/how-i-build` operating-model tabs. Read at the same pinned sha, `c3233de`
(`~/Projects/evalaxis/evalaxis-ai`) — no new commit, just a closer read of files the original
audit didn't quote.

| Claim | Status | Source |
|---|---|---|
| Scores five named metrics | `VERIFIED` | `src/evalaxis/core/metrics/`: `faithfulness.py`, `answer_relevancy.py`, `hallucination.py`, `context_precision.py`, `context_recall.py` — five files, five metrics, matching `README.md`'s own list |
| Default judge is deterministic and runs offline | `VERIFIED` | `README.md`: *"By default it uses a deterministic fake judge that runs offline and for free"*; `src/evalaxis/judge/fake.py` exists as the implementation |
| Ships as a CLI and a composite GitHub Action | `VERIFIED` | `src/evalaxis/cli/` (four command modules); `gha/action.yml` header: `runs: using: composite` |
| With no baseline committed, the gate fails open (passes) rather than blocking | `VERIFIED` | `gha/action.yml`: `if not baseline_path.exists(): print('::warning::...regression gate skipped...'); sys.exit(0)` — exits 0 (success) and prints a warning, not a failure |
| Does not measure semantic quality | `VERIFIED`, unchanged from the original audit above | the fake judge's determinism is a mechanism proof, not a quality signal — the original audit's own framing |

---

## Aegis Contracts

Early work on contract-shaped guarantees between AI systems. Its question, from the site's own
copy: *"What should one AI system be allowed to promise another — and who checks?"*

### AUDITED 2026-09-01 — read via `gh api`, still not cloned locally

The owner directed a verification pass for the new `/how-i-build` operating-model tabs (P-18
territory: he supplied the specific claims from a mockup, and instructed they be checked against
the real repository rather than dropped). Read via `gh api repos/imrohitagrawal/aegis-contracts`
— the GitHub API, not a local clone; every figure below traces to a file read at that commit,
not to memory or the mockup.

| Claim | Status | Source |
|---|---|---|
| "Three versioned contracts: canonical artifact schema, traceability node/edge/coverage model, CloudEvents catalogue" | `VERIFIED` | `README.md`: *"The three frozen contracts every component of the AI-QE platform composes around... 1. Canonical artifact schema — schemas/*.json... 2. Traceability schema — traceability/... 3. Event format — events/ (CloudEvents 1.0 envelope + event catalog)"* |
| Versioned, additive-only within v1 | `VERIFIED` | `README.md`: *"Status: v0.1.2 — additive changes only within major v1"*; `docs/VERSIONING.md` states SemVer per schema, backward-compatibility CI checks, and *"Freeze status: v0.1.0 is frozen for v1 scope"* |
| "Models acceptance-criteria-level coverage as a first-class object" | `VERIFIED` | `docs/adr/0002-ac-level-coverage.md`: *"The AC is the unit of coverage... ACs are first-class nodes with stable ids"* |
| Private | `VERIFIED` — unchanged | `gh repo list imrohitagrawal` shows `aegis-contracts`, private, still not cloned to `~/Projects` |

**What is still not claimed:** any running system, any consumer of the contracts, any timeline,
any adoption. This is a schema/contract repository — 11 JSON Schemas, a traceability node/edge
registry, an event catalogue and their generated language bindings (Python, TypeScript) — not a
deployed service. The three-contract structure and the AC-level coverage decision are the only
claims this audit backs; nothing about scale, usage, or maturity beyond "frozen at v0.1.2" is
asserted.

**Correction to an earlier statement of mine, kept for the record:** on 2026-08-11 I told the
owner Aegis Contracts had "no repo to harvest" — checking only `~/Projects` and concluding the
repository did not exist, when it exists on GitHub and was simply not cloned. Recorded in D63.
*"Not cloned"* is a different fact from *"does not exist"*, and stating the stronger one was a
guess wearing the clothes of a check. This audit corrects the same class of error the other
direction: the repository was real and checkable via the API the whole time; nobody had asked.

### What the site may say now

The three-contract structure, the AC-level coverage decision, the versioning discipline, and
that it is private and early-stage. Still no capability claim beyond what is in the contracts
themselves, no timeline, no adoption, no running system.
