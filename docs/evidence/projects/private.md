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

---

## Aegis Contracts

Early work on contract-shaped guarantees between AI systems. Its question, from the site's own
copy: *"What should one AI system be allowed to promise another — and who checks?"*

### State: nothing verifiable

| Fact | Status |
|---|---|
| The repository exists | `VERIFIED` — `gh repo list imrohitagrawal` shows `aegis-contracts`, private |
| **Not cloned on this machine** | `VERIFIED` — no `~/Projects/aegis*` path exists |
| Any code, test, or artifact within it | `UNVERIFIED` — nothing has been read |

**Correction to an earlier statement of mine:** on 2026-08-11 I told the owner Aegis Contracts
had "no repo to harvest". That was wrong — I had checked only `~/Projects` and concluded the
repository did not exist, when it exists on GitHub and is simply not cloned. Recorded in D63.
The practical position is unchanged (nothing can be quoted), but the reason matters: *"not
cloned"* is a different fact from *"does not exist"*, and stating the stronger one was a guess
wearing the clothes of a check.

### What the site may say

Only what the owner has written: the question it exists to answer, that it is early-stage, and
that it is private. No capability claim, no timeline, no artefact.

To move beyond this, the repository would need cloning and the same audit the other four
received. Until then it is honestly a name and a question — and the site already says so.
