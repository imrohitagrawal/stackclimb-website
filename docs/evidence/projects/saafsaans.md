# SaafSaans

A Delhi-NCR air-quality companion that scores *your* risk — age, condition, planned activity —
rather than the city average, and answers questions with cited health guidance.

**Measured 2026-08-11 at `667397a`** (committed 2026-08-10), tree
`~/Projects/saaf-saans`. Live at `saafsaans.stackclimb.com` — answered HTTP 200 in **0.46s**.

> **Which tree.** `saaf-saans` is current. `saaf-saans-stable` is a frozen v1 snapshot
> (`d73491`, 07-21). `saafsaans` without hyphens is a 200 KB docs-only stub — not code, ignore it.

---

## VERIFIED — counted directly

| Claim | Value | Command |
|---|---|---|
| Application Python | **8,339 lines** | `find saafsaans -name '*.py' \| xargs wc -l` |
| Test Python | **16,199 lines** — 194% of app | `find tests -name '*.py' \| xargs wc -l` |
| Test functions | **771** | `grep -rh 'def test_' tests --include='*.py' \| wc -l` |
| Commits | **236** | `git rev-list HEAD --count` |
| Seeded advisories | **43**, each with a named source | `len(saafsaans.data.advisories.ADVISORIES)` |
| WAQI stations | **21** | `len(waqi.FEED_MAP)` |
| CPCB cities | **5** | `len(cpcb.CITY_OF)` |
| Injection patterns | **39** across English, Devanagari and Hinglish | `len(guard.PATTERNS)` |

### Correction — the number currently on the live site is wrong

`src/pages/index.astro` states **628 test functions**. The real figure at HEAD is **771**.
The site understates itself by 18%.

**Two different counts exist and must not be mixed:** `grep 'def test_'` gives **771 test
functions**; `pytest --collect-only` gives **1,414 collected tests**, because parametrised cases
expand. The site's caption says "test functions", so **771** is the like-for-like replacement.

---

## The hard engineering — for the panel's supporting line

**Dual-source arbitration that never merges**, `saafsaans/services/waqi.py:438` (`_choose`).

CPCB publishes a rolling 24-hour mean; WAQI publishes the latest hourly value — established by
measurement in `docs/decisions/0005-averaging-window.md`. Field-wise merging would produce a
reading wearing one timestamp and one station name that is an average of two different physical
quantities. So the rule is **pick one whole reading, never blend**.

Three defects are documented *in the source, with the measurement that found each*:

> *"Wazirpur held a PM10-only index of 119 while WAQI was publishing 280 for the same station,
> and WAQI was never called."* — `waqi.py:456`

> *"measured on a CPCB outage, every Delhi tile rendered '--' while `cpcb.values_for` was
> returning pm25 53 / pm10 90 on that very render."* — `waqi.py:472`

> *"The previous version had no such check and presented the Anand Vihar, Delhi station as
> Noida's reading."* — `waqi.py:546`, fixed by `_corroborates()`

Freshness is three states — `stale`, `retained`, `fresh` — and the cache TTL follows **what
actually arrived**, not the status word: 600s fresh, 60s degraded.

**Second, and the better LLMOps story: the two-ladder monotonic verdict merge**,
`llm.py:332-388`. An AQI ladder and a persona ladder both run and **the stricter wins**
(`_STRICTNESS = {"GO": 0, "CAUTION": 1, "NO-GO": 2}`). It closes a defect where, between AQI 101
and 150, an asthma reader was told the air was *"acceptable"* directly beneath a hero telling
them to skip outdoor exercise — *"two verdicts on one page, disagreeing in the dangerous
direction. The hero is not weakened to match; the card is raised to it."* That is a
safety-monotonic composition guarantee between a generative surface and a deterministic scorer.

**Third: provenance that is checkable rather than asserted.** `risk.py` splits grounded from
ungrounded — `dose_pts` comes from EPA Exposure Factors Handbook 2011 Table 6-2 inhalation
rates; `susceptibility_pts` is labelled `SOURCE_UNVALIDATED`. `weight_table()` emits every
weight with a `grounded` flag and a source string, **a test fails the build if any weight has no
source** (`tests/test_risk.py:131,148`), and the same table is rendered to the user in the Guide.

**Fourth: the guard's own threat model**, `guard.py:19-35`, which names the bypass it does not
stop — NFKC is a compatibility fold, not a confusable fold, so *"'ignorе your instructions' with
one Cyrillic letter passes every pattern below."* It then states where the real boundary is:
*"the system prompt is a fixed constant and the question is framed to the model as data, not
instructions."*

---

## Panel assets — live captures, 2026-08-11

Both taken from the running site, not from stored screenshots.

| File | Source |
|---|---|
| `src/assets/projects/saafsaans-en.webp` | `https://saafsaans.stackclimb.com` |
| `src/assets/projects/saafsaans-hi.webp` | `https://saafsaans.stackclimb.com/?theme=light&lang=hi` |

Both show `● LIVE · 5:00 PM` · `AQI 270 · POOR` and the risk delta: **`EXAMPLE PERSONA ·
76/100 · VERY HIGH`** beside **`healthy adult, same plans · 64`**. Same air, different person.

`EXAMPLE PERSONA` is **not** a data disclaimer — the air reading is live. It labels the *default
persona*, and the page invites replacement: *"Fill in your own details and the advice becomes
yours."*

The Hindi capture additionally carries a bilingual warning that no Hindi speaker has reviewed
the translation, with a specific carve-out for medicine and inhaler information.

**Both crops stop above the time-window strip**, which shows a defect the owner is fixing: at
5:00 PM it recommends *"Late morning (about 9 AM–12 PM)"*. Nothing left in frame depends on it.
**Re-capture the full hero once that fix lands.**

Superseded: the stored `docs/screenshots/today-light.jpg` carried `SAMPLE — not a reading`. The
live capture has no sample label at all, so no crop of a disclosure was needed (D63).

---

## Must not be claimed

- **Never "live"** as an unqualified state — it is deployed on a 256 MB Fly.io machine in Mumbai
  that suspends when idle, so a first request after a quiet spell is slow. It went down 21 July
  and was redeployed 9 August.
- **`docs/CASE-STUDY.md` is stale** — pinned at an older commit, reporting 831 tests and 5,958
  app lines against today's 771 functions and 8,339 lines. Re-derive; never copy it.
- **No serialised evaluation artifacts exist** — no `reports/`, no eval JSON. The evidence is
  the live site, the screenshots and the code. That is honest, but there is nothing to quote as
  a stored run.
- `docs/decisions/0001-zero-javascript.md` describes itself as *"an open, undecided question
  with no recorded evidence behind it"* — do not present zero-JS as a validated decision.
- Medical advice, users, adoption, scale, or continuous uptime. The product refuses all four
  on-screen.
