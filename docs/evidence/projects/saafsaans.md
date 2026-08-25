# SaafSaans

A Delhi-NCR air-quality companion that scores *your* risk — age, condition, planned activity —
rather than the city average, and answers questions with cited health guidance.

**Re-measured 2026-08-14 at `10f4213`** — `origin/master`, the published default branch. The
2026-08-11 audit below measured `667397a`, which is one **unpushed commit ahead** of master on
the feature branch `gate1a-window-true-at-the-hour` (`667397a^ = 10f4213`); W-1 pins the pass
to master, so two figures moved backwards. Verified by two independent read-only lenses plus a
skeptic re-derivation on a `git archive` of the pinned sha.

> **Which tree.** `saaf-saans` is current. `saaf-saans-stable` is a frozen v1 snapshot
> (`d73491`, 07-21). `saafsaans` without hyphens is a 200 KB docs-only stub — not code, ignore it.

## Re-measured at `10f4213` — package C, 2026-08-14

| Claim | Value at `10f4213` | Command |
|---|---|---|
| Test functions | **767** (was 771 at `667397a`) | `grep -rh 'def test_' tests --include='*.py' \| wc -l` |
| Test Python | **16,072 lines — 193% of app** (was 16,199 / 194%) | `find tests -name '*.py' \| xargs wc -l` |
| Application Python | **8,339 lines** — unchanged | `find saafsaans -name '*.py' \| xargs wc -l` |
| Injection patterns | **39** — unchanged. Executed count; a raw grep of pattern-shaped lines gives 40 and is wrong | `python3 -c "from saafsaans.services import guard; print(len(guard.PATTERNS))"` |
| Feeds | **21 entries, exactly 2 `None` (Ashok Vihar, Nehru Nagar), 19 live** — unchanged | `python3 -c "from saafsaans.services import waqi; print(len(waqi.FEED_MAP))"` |
| Time-window defect | **Still present.** `best_window` reads only `clock.today_ist().month`; no code path reads the hour. The fix lives on the unmerged feature branch, not on master | `grep -n 'hour\|today_ist' saafsaans/services/forecast.py` |
| Serialised eval artefact | **Still none.** No `reports/`, no eval JSON; the only ndjson is a Kibana dashboard export | `find . -type d -name reports` |

### Correction — the proof line said "senior"; the persona is an adult

The site's proof line read *"The senior with asthma scores 76."* Wrong: the default persona is
age **Adult**, condition Asthma (`saafsaans/web/main.py:174-179`). Executed at the captured AQI 270:
adult + asthma = **76** (Very High) · healthy adult, same plans = **64** · senior + asthma =
**86** (Extreme). The entry's own alt text always said "adult with asthma" — the proof line
contradicted it. Fixed in package C; command:
`risk.compute_risk(270,'asthma','outdoor_exercise','adult')`.

### VERIFIED — the competency vocabulary, each term confirmed in code

- **Trilingual injection guard with NFKC + `Cf`-stripping and negation lookbehinds** —
  `guard.py:381` normalises the *patterns*, `:387` the input, `:393` strips `Cf` (zero-width,
  ZWJ, bidi); negation lookbehinds per language at `:108` (EN), `:205` (Devanagari), `:336`
  (Hinglish). The guard was tuned against false positives: `:102-108` records *"do not ignore
  your doctor's instructions is how a health app phrases its most important sentence"*, and
  each narrowing carries the ordinary sentence that forced it (`:169-183`, `:333-343`).
- **Two-ladder stricter-wins merge** — `llm.py:65` `_STRICTNESS`, `:384-386` the raise-only
  merge. **Scope, precisely:** the merge lives on the deterministic path, which is what serves
  in production (no API key is set, by design — `DEPLOY.md:77`: *"a public URL with an open
  text box and a paid API key is an uncapped bill"*). On the paid path the floor reaches the
  model as a prompt instruction, not a post-parse clamp — a MINOR limit, contained by the
  key's deliberate absence. The site's wording ("both run, the stricter wins") is correct;
  "overrides a generative output" would overclaim. The 08-11 section below saying
  *"safety-monotonic composition guarantee"* is **superseded by this precision**.
- **Three-state freshness threaded into the prompt** — `presenters.py:541` one predicate for
  every surface; `llm.py:114-126` appends *"HELD READING, NOT CURRENT: describe it as an
  earlier measurement, never as the air right now"* to the model's input.
- **The risk band travels only as far as its freshness** — `saafsaans/web/main.py:846-866`: the band is
  passed to the answer card only when a reading exists AND freshness is `live`; the 18-line
  comment records the defect this closed (a maximum-severity instruction printed from an
  assumed number the hero had already refused to show).

### Phrasing that must NOT be used

- *"Rate limits sized three orders apart"* — the repo's own comment (`ratelimit.py:44`) is
  wrong; the true probe-to-ask ratio is **60×** (1,200 vs 20 per 5 minutes). REFUTED as copy.
- The paid path is never described as clamped; production is never described as calling an LLM
  (the deployed app answers every question from the deterministic path, and `/health` says
  `"llm": false`).

---

## VERIFIED — counted directly

| Claim | Value | Command |
|---|---|---|
| Application Python | **8,339 lines** | `find saafsaans -name '*.py' \| xargs wc -l` |
| Test Python | **16,199 lines** — 194% of app | `find tests -name '*.py' \| xargs wc -l` |
| Test functions | **771** | `grep -rh 'def test_' tests --include='*.py' \| wc -l` |
| Commits | **236** | `git rev-list HEAD --count` |
| Seeded advisories | **43**, each with a named source | `len(saafsaans.data.advisories.ADVISORIES)` |
| WAQI feed entries | **21**, of which **19 carry a feed** | `len(waqi.FEED_MAP)`; `sum(v is None for v in FEED_MAP.values())` = 2 |
| CPCB cities | **5** | `len(cpcb.CITY_OF)` |
| Injection patterns | **39** across English, Devanagari and Hinglish | `len(guard.PATTERNS)` |

**The site says `19 live · 2 known gaps`, not "21 stations".** Two entries — Ashok Vihar and
Nehru Nagar — map to `None` because WAQI carries no station for them, and one more
(`Delhi (city)`) is a city-level feed rather than a station. Quoting 21 counts the two
absences as coverage. Naming the gaps is both more accurate and more on-thesis.

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

Taken from the running site, not from stored screenshots.

| File | Source |
|---|---|
| `src/assets/projects/saafsaans-en.webp` | `https://saafsaans.stackclimb.com` |
| `src/assets/projects/saafsaans-crop.webp` | crop of the above — the persona line, headline and both score chips, 728×186. **Re-cut 2026-08-26 (DEF-70):** it was a 900×267 phone crop served below 700px; the home plate now shows it at every width (`homeCrop`), because the full capture rendered at 0.30 of its size in the desktop column. The project page still shows the full capture above 700px |

**Removed 2026-08-12 (D74):** `saafsaans-hi.webp`, captured from
`https://saafsaans.stackclimb.com/?theme=light&lang=hi`. It was referenced by nothing — no
plate, no component, no test — while `Shot.astro`'s eager glob still emitted it into
`dist/_astro/` on every build. Recorded rather than silently dropped: it was a real live
capture, and if the Hindi surface is ever given a panel it should be re-taken, not recovered
from git and passed off as current.

Both captures show `● LIVE · 5:00 PM` · `AQI 270 · POOR` and the risk delta: **`EXAMPLE PERSONA ·
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
