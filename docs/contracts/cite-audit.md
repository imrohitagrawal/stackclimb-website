# Contract — `cite-audit` (DEF-71 part 2, the gate)

Phase 1a of `docs/practices/autonomous-run.md`: write what the thing promises, over what
input space, before writing the gate. No gate code lives here.

## RCA note, before the contract

D164 stopped `cite-audit` on two unanswered questions, both root-caused to the same
mistake: the branch wrote the FIX before the CONTRACT. (1) The exemption table keys a
citation on `(citing file, citing line, hit-string)`, but the scanner's own regex
(`NAME = [A-Za-z0-9_.-]+`, no `/`) strips the directory off every match before an
exemption is ever checked — so two different real targets that share a basename and line
number are indistinguishable at the point exemption is decided, and a new in-repo
citation can hide behind an old node_modules exemption. (2) The 18-assertion self-test
never calls `audit()` or touches the script's own `if (breaches.length)` exit branch, so
a one-character typo there (`breaches.lenght`) prints `SELF-TEST PASS` while a live
breach passes through as green. Both gaps are enumeration gaps, not coding gaps — this
document is the enumeration.

## (a) The promise

**The gate fails when a scanned file, under `ROOTS`, contains a line whose text matches
the `CITATION` pattern (a bare `name.ext:span`, a `,:span` continuation, or a
`.githooks/name:span`) at a `(file, line)` position not listed, with an exact matching
`hit` string, in the hand-written `EXEMPT` table.**

That is one sentence and it is written from the code as it exists on branch `cite-audit`,
not from intent — see (b) for what it silently leaves undefined.

## (b) The dimensions

What varies about a citation-shaped string in a scanned line. Eight are the ones named in
the task; four more are implied by reading the scanner's own logic and are marked
**[implied]**.

1. **Form** — bare `file.ext:NN`, range `file.ext:NN-MM`, continuation `,:NN` off a prior
   citation on the same line, `.githooks/name:NN`, bare `file.ext` with no line at all,
   prose (`"file.ext line 82"`, `"#L82"`), a look-alike (contrast ratio `4.5:1`, a URL
   port `localhost:4321`, a URL-embedded path+line `x.io:8080/a.js:3`).
2. **Target existence** — exists tracked in this repo, does not exist anywhere, exists
   but untracked (`node_modules`), points into an external repository this repo cannot
   read.
3. **Basename collision** — the cited basename is unique in the repo vs. it collides
   across two or more real paths (`src/expect.js` vs `tests/lib/expect.js`).
4. **Syntactic context** — inside a `//` or `/* */` comment, inside a string literal,
   inside a JSDoc block, inside otherwise-live code (an identifier, a URL constant).
5. **Npm-package look-alike** — a package/version token that happens to parse as
   `name.ext:span` under `TARGETS` (e.g. a hypothetical `purify.js:3` version pin).
6. **Location: docs/ prose vs. code** — the string sits in `docs/*.md` prose vs. in
   `src/`, `tests/`, `scripts/`, or the two named config files.
7. **Grandfather status** — the citation is new vs. it was previously exempted and swept
   or rewritten by D165.
8. **Target extension** — inside `TARGETS` (`js|mjs|cjs|ts|astro|css|md|py|json|yml|html`)
   vs. outside it (`.png`, `.txt`, `.toml`, extensionless).
9. **[implied] Citing-file extension vs. `SCANNED`/`ROOTS`** — the citing file has an
   extension in `SCANNED` (`js|mjs|cjs|ts|astro|css|html`) and sits under `ROOTS`, vs. it
   has a source extension the gate does not scan at all (`.jsx`, `.svelte`, `.py` outside
   `scripts`), vs. it sits under a root the gate does not cover (`.github/workflows/`,
   `.githooks/`, `docs/`).
10. **[implied] Exemption re-target after a text edit at the SAME `(file, line)`** — the
    exact line at an exempted `(file, line)` is edited so its comment now cites a
    *different* real target that happens to produce the identical stripped `hit` string
    (same basename, same span) as the thing originally exempted. `isExempt()` cannot
    distinguish the old, reviewed citation from the new, unreviewed one — this is the
    concrete shape of the D164 CRITICAL_BLOCKER, not a hypothetical.
11. **[implied] Citing-line-number drift from an unrelated edit** — a line is
    inserted or deleted anywhere ABOVE an exempted line in the same file, shifting the
    exempted citation to a new line number with its text unchanged. Partner 3's liveness
    check reads `EXEMPT[i].line` literally, so this makes a genuinely-still-valid,
    untouched exemption go stale and start failing the build — a false RED, the mirror
    image of dimension 10's false GREEN.
12. **[implied] Multiple citations on one line** — the continuation form (`,:span`) means
    a single line can carry more than one `hit`; exemption is per-citation
    (`breaches.push` happens per `hit`), so one exempted and one unexempted citation can
    coexist on the same line.

## (c) The values on each axis

| Axis | Values |
|---|---|
| 1. Form | bare, range, continuation, `.githooks`, bare-no-line, prose, ratio-lookalike, URL-lookalike |
| 2. Target existence | in-repo tracked, nonexistent, in-repo untracked (`node_modules`), external repo |
| 3. Basename collision | unique, colliding (2+ real paths, same basename) |
| 4. Syntactic context | `//` comment, `/* */` comment, JSDoc, string literal, live code |
| 5. Npm look-alike | yes, no |
| 6. Location | `docs/*.md`, `src/`\|`tests/`\|`scripts/`\|named configs |
| 7. Grandfather status | new, previously-swept-and-clean, previously-exempted-unchanged, previously-exempted-then-edited |
| 8. Target extension | in `TARGETS`, not in `TARGETS` |
| 9. Citing-file coverage | scanned root+extension, unscanned extension, unscanned root |
| 10. Exemption re-target | same target unchanged, target silently swapped at same `(file,line)` |
| 11. Line-number drift | stable, shifted by an edit above it |
| 12. Citations per line | one, two-plus (continuation) |

## (d) The matrix

Verdicts: **FIRES** (breach, exit 1), **SILENT** (not matched at all — the pattern never
sees it), **EXEMPT** (matched, but excused and declared so in `EXEMPT`), **UNDEFINED**
(the scanner's behavior depends on axes 10/11 in a way nobody decided on purpose).

| # | Cell (dominant axes) | Verdict | Why |
|---|---|---|---|
| 1 | bare, in-repo tracked, unique basename, `//` comment, `src/`, new, in TARGETS, scanned root | FIRES | Exact DEF-71 case: the whole reason the gate exists. |
| 2 | range `NN-MM`, same as #1 | FIRES | `SPAN` includes the hyphenated range explicitly. |
| 3 | continuation `,:NN` after a prior citation, same line | FIRES (both) | Two `hit`s from one line, checked independently — axis 12. |
| 4 | `.githooks/name:NN` | FIRES | `HOOK` alternative in `CITATION`; this is the one extensionless in-repo form the pattern names by exception. |
| 5 | bare `file.ext`, no line | SILENT | `CITATION` requires `:span`; a bare filename never matches. Declared explicitly in the header ("Citing the file stays legal"). |
| 6 | prose ("file.ext line 82", "#L82") | SILENT | No colon-digit shape; the header discloses this as a known miss. |
| 7 | ratio look-alike (`4.5:1`) | SILENT | `TARGETS` requires one of the listed extensions before the colon; `4.5` is not `name.ext`. Verified in the self-test's `ignores` fixture. |
| 8 | URL with port (`localhost:4321`) | SILENT | `URL` regex strips it before `CITATION` runs. Verified in self-test. |
| 9 | URL with embedded path+line (`x.io:8080/a.js:3`) | SILENT | Same URL-strip; verified in self-test. |
| 10 | nonexistent target file, otherwise like #1 | FIRES | The gate is explicitly a POINTER-FORM check, not a truth check (header, "WHAT THIS CANNOT CATCH"). It fires on the FORM regardless of whether the target exists. Truth-checking is out of scope by design. |
| 11 | in-repo untracked (`node_modules`), unique basename, exempted, unchanged | EXEMPT | The four `node_modules` rows in `EXEMPT` (`playwright.config.js:23`, `:55`, `tests/geometry.spec.js:124`, `viewport-clip.mjs:140`). |
| 12 | in-repo untracked, NOT in `EXEMPT` | FIRES | Untracked-ness alone is not an exemption; only an explicit table row is. A new, un-reviewed `node_modules` citation still fires. |
| 13 | external-repo target, exempted (`main.py:174-179`) | EXEMPT | The one `src/data/projects.js:128` row — declared "UNCHECKABLE... re-verify by hand." |
| 14 | external-repo target, NOT exempted | FIRES | Same as #12: form-matching, not target-aware. |
| 15 | basename collision, both paths new, unique `(file,line)` per citation | FIRES (each independently) | Exemption key includes the CITING `(file,line)`, which is unique per source location even when the `hit` string collides. Two different citing lines never share an exemption slot just because their hits match. |
| 16 | basename collision, dimension 10 (re-target at the SAME citing `(file,line)`) | **UNDEFINED — false EXEMPT** | The D164 CRITICAL_BLOCKER. `playwright.config.js:23` is exempted for `expect.js:12486`. If that exact line is edited to instead read `... src/expect.js:12486` (or any other real target sharing the stripped basename+span), `isExempt()` still returns true: `file` and `line` are unchanged, and `hit` is computed from the SAME regex that already discarded the directory, so it is textually identical to the exempted string. The gate stays green over a brand-new, unreviewed, in-repo citation. Nothing in the current design can tell these apart, because the exemption never records the DIRECTORY of what it excuses — only the citing location and the stripped basename+span. |
| 17 | dimension 11 (line-number drift, exemption target unchanged) | **UNDEFINED — false FIRES** | Insert one line above `playwright.config.js:23`; the real exemption text is now on line 24. `isExempt('playwright.config.js', 24, 'expect.js:12486')` returns false — no `EXEMPT` row has `line: 24` — so an untouched, previously-reviewed citation now breaches. Partner 3 (liveness) would ALSO fail here, correctly reporting the row stale, but the fix a maintainer reaches for under time pressure is "renumber the table," which silently repeats dimension 16's flaw rather than fixing the identity model. |
| 18 | live code (not comment, not string), otherwise like #1 | FIRES | The scanner has no comment/string-region awareness at all (unlike D165's sweep, which used a comment-region state machine). It matches raw line text regardless of syntactic context. This is a real gap against the header's own promise ("a comment may cite a FILE") — the gate is wider than its stated subject. |
| 19 | string literal containing citation-shaped text | FIRES | Same reasoning as #18 — no distinction is made. |
| 20 | JSDoc block | FIRES | JSDoc is `/* */`, already covered by #1's "comment" case; no separate handling exists. |
| 21 | npm-package look-alike matching `name.ext:span` under `TARGETS` | FIRES (false positive, undeclared) | Nothing in `CITATION` distinguishes a package/version token from a file citation. Not tested by the self-test's `ignores` fixtures (which cover ratio/URL/bare-filename, not package-version tokens). Declared here as a live gap, not previously named in the header's "WHAT THIS CANNOT CATCH" list. |
| 22 | `docs/*.md` prose citation, any form | SILENT (out of scope) | `docs` is not in `ROOTS`, by the owner's 2026-08-27 ruling, recorded in the header. See (e). |
| 23 | citing-file extension not in `SCANNED` (e.g. `.jsx`, `.svelte`) under `ROOTS` | SILENT | Header discloses this as a prospective gap: "A future .jsx or .svelte file would be skipped silently." |
| 24 | citing file under `.github/workflows/` or `.githooks/` | SILENT | Both outside `ROOTS`; header discloses zero citations there today, "a prospective gap, not a live breach." |
| 25 | target extension not in `TARGETS` (e.g. `.png`, `.toml`) | SILENT | `FILE_LINE` requires an extension from `TARGETS`; anything else never matches, whether or not a real file with that extension and a real line number is meant. |
| 26 | grandfather: previously swept by D165, unchanged since | SILENT | The form is gone from the text; nothing to match. |
| 27 | grandfather: previously swept, someone re-adds the exact same rotted form later | FIRES | No grandfathering by history — the gate only reads what is on disk now. Correct: re-introducing the banned form must fire regardless of past cleanup. |
| 28 | self-test's own four `finds` fixtures (plain, range, continuation, hook) | FIRES (in self-test partner 1) | Directly exercises `citationsIn()`, not the file-scanning path — see (f) on why this still leaves the real exit-decision unexercised. |
| 29 | self-test's own four `ignores` fixtures (localhost url, url+path, ratio, bare filename) | SILENT (in self-test partner 1) | Same seam — `citationsIn()` only. |
| 30 | exemption row whose citing file no longer exists (deleted or renamed) | **UNDEFINED — false FIRES/crash risk** | Partner 3's `readFileSync` is wrapped in `try/catch` returning `''`, so `citationsIn('')` is `[]` and `live` reports FAIL (correctly flagging staleness) without throwing. But nothing in the real `audit()` path re-checks EXEMPT rows against files that no longer exist — a stale row simply sits inert. Declared here rather than left implicit: this is benign (an inert stale row costs nothing) but is the mechanism dimension 17 rides on, so it belongs in the same cell family. |

## (d-cont) Additional cells, added after round-1 adversarial review

Round 1 of `codex exec --sandbox read-only` review named 23 findings against the matrix above.
Genuine gaps (cells the matrix did not have) are added here rather than folded silently into
the table, so the addition is traceable to the finding that forced it.

| # | Scenario | Verdict | Reason |
|---|---|---|---|
| 21 | **Two identical citation strings on the SAME line** (`foo.js:3` appearing twice in one comment) | **BOTH exempted, or BOTH flagged, together — never independently** | The exemption identity is (citing file, citing line, matched string), which does not distinguish *occurrence* within a line. Exempting one occurrence of `foo.js:3` on a line exempts every identical occurrence on that same line. **Declared residual, not fixed here** — closing it needs an occurrence index added to the identity tuple, which is a code change, out of scope for this doc-only phase. Filed forward |
| 22 | **A continuation citation whose base differs but whose span is identical** (`foo.css:1, :2` and `bar.css:3, :2` on different lines or the same line) | Each `:2` is matched and checked **independently by (file, line, string)** | Not actually a collision across different citing lines (line differs → different identity). Two continuations sharing a span on the SAME line collapse to cell 21 above, not a new case |
| 23 | **`node_modules/`, `public/`, `vite.config.ts`, or any code file NOT named in `ROOTS`** | **PASS, unscanned** | `ROOTS` is an explicit allowlist (`src`, `tests`, `scripts`, `playwright.config.js`, `astro.config.mjs`); anything outside it is never read, regardless of content. This is a *different* mechanism from the `docs/`-ruling exemption (cell 9) — it is an omission by the allowlist's own scope, not a scoping ruling — and is declared as its own category rather than conflated with cell 9 |
| 24 | **A markdown file physically located inside an in-scope root** (hypothetically `src/content/note.md`) | **PASS, unscanned** | `SCANNED` (`/\.(js\|mjs\|cjs\|ts\|astro\|css\|html)$/`) excludes `.md` regardless of `ROOTS` membership — two independent filters, both must pass. No such file exists in this repo today (checked); declared for completeness |
| 25 | **A citation-shaped string with allowed-extension prefix but non-citation intent** (`"cache.js:3000"` as a host:port, `const fixture = "foo.js:3"` as scanner test data) | **FLAG — a declared false-positive class, not a residual gap** | `TARGETS` cannot distinguish "ends in `.js`, followed by a number" from "is actually a citation." Cell 12 only covers the case where the prefix fails `TARGETS` entirely (a *port* number after a *non-extension* word); it does not cover a word that happens to end in an allowed extension. **This is a real, disclosed false-positive risk**, not previously stated. No live instance found in the current scan set (checked: `git grep -nE '[a-z]+\.(js|mjs|ts|css):[0-9]'` against `src`,`tests`,`scripts` for non-citation patterns, none found), but the mechanism means a future host:port literal ending in an allowed extension word would need a manual `EXEMPT` entry, same as any other false-positive-shaped breach |
| 26 | **Any character outside `[A-Za-z0-9_.-]` in the basename** (a space: `"my file.js:3"`, a backslash path: `"..\lib\foo.js:3"`, a non-ASCII character: `"café.js:3"`) | **Matches only the trailing run of allowed characters** | Generalizes the path-prefix residual in (f): `NAME` excludes any of these characters, not only `/`. `"my file.js:3"` and `"file.js:3"` reduce to the identical hit `file.js:3`, so an exemption for the latter would also silence the former. Same mechanism as (f)'s declared path-prefix gap, same disposition: declared, not fixed, no live instance |
| 27 | **A citation whose target genuinely does not exist anywhere, is untracked, or is external** — regardless of whether it is exempted | **Verdict is unaffected by target existence in every case** | This is a form ban: whether the cited file exists, is tracked, or is readable never changes the FLAG/PASS verdict for the form itself — only whether an `EXEMPT` entry for it is even checkable by a human later (relevant to *maintaining* the exemption table, not to the gate's pass/fail decision). Stated explicitly here because dimension 7 in (b) listed target existence as a variable without the matrix ever saying it is verdict-irrelevant |
| 28 | **An orphan continuation — `,:N` appearing with NO preceding base citation on the same line** (`// tuple marker ,:2`) | **FIRES — a declared false-positive class, found by round-2 review** | `CONTINUED` (`,\s*:span`) matches independently of whether a `FILE_LINE` alternative matched earlier on the same line; the regex has no memory of a prior match. Cell 3 (in (d)) and cell 22 above both describe the continuation form only in the context of a genuine prior citation — neither covers the case where no base citation exists at all. **No live instance found** (checked: `git grep -nE ',\s*:[0-9]' src tests scripts` for the pattern outside a real continuation context — none). Same disposition as cell 25 (host:port lookalike): a disclosed, mechanism-level false-positive risk, not a false-accept, and not blocking — a real occurrence would need a manual `EXEMPT` entry like any other false positive |

## (g-cont) Fixture obligations found by round-1 review, not yet built

These are gaps in what the self-test in section (g) actually *proves*, as opposed to gaps in
the matrix. Recorded as obligations for the eventual build phase (this document does not touch
`tests/cite-audit.mjs`):

- Partner 2 proves the matcher finds seeded hits; it does not prove an unexempted hit reaches
  `process.exit(1)`. Needs an end-to-end fixture: seed one real unexempted breach, assert the
  process actually fails, not merely that `audit()` returns a non-empty array.
- No fixture proves the exemption identity is the FULL triple rather than a weaker projection
  of it (file+line only, file+string only, string only, or "everything is exempt"). Needs a
  truth-table fixture set: exact triple → pass; any one field changed → fail; no exemption →
  fail (5 cases minimum, matching cell 8/20 and the new cells 21-22 above).
- No fixture proves every match on a line is processed, not just the first. Needs a two-citation
  line, one exempted and one not, asserting the unexempted one still breaches.
- The enumeration floor (`FLOOR = 120`) plus three named files does not prove the extension list
  or `ROOTS` are complete — dropping an extension or a directory can still clear both checks.
  Declared as a known weak partner rather than silently trusted; tightening it (e.g. asserting
  the exact `SCANNED` regex against a fixed list of extensions) is future work, not required to
  close DEF-71 as scoped.
- No fixture exercises a string-literal-only citation distinctly from a comment one (cell 14).
- Partner 4 (exemption liveness) does not run the exempted line's text through the SAME
  `citationsIn()` pipeline the real scan uses — it only checks the raw text contains the
  string. A citation that would actually be excluded from scanning for another reason (inside a
  URL) could still read as "live." Needs the liveness check to call `citationsIn()` itself
  rather than `String.includes()`.

None of these change the PROMISE, the DIMENSIONS, or any VERDICT in the matrix — they are
missing proof of properties the matrix already claims, which is exactly the class of defect
"every gate ships a failability partner" exists to catch before it ships, not after.

## (d-cont-2) Further matrix gaps, found by a SECOND round-1 codex pass

A second `codex exec --sandbox read-only` invocation (run separately from the one behind
(d-cont)/(g-cont) above, same prompt discipline: name a citation fitting no cell, or a
way the exit decision could silently stop failing) returned five matrix findings and
eleven failability findings. Recorded verbatim, then dispositioned.

| # | Scenario (codex's exact wording) | Disposition |
|---|---|---|
| 32 | Standalone continuation with no preceding citation: `,:12` or `, :12` | **Real gap, new cell.** `CONTINUED` (`,\s*:SPAN`) matches unconditionally — nothing in the regex requires an earlier `FILE_LINE` match on the line. `,:12` alone in a comment FIRES today with `hit = ',:12'`, an orphaned citation to nothing. Not previously in the matrix. |
| 33 | Multiple FULLY-WRITTEN citations on one line, not the continuation form: `foo.js:1 and bar.css:2` | **Real gap, new cell.** Existing cell 3 covers only the `,:span` continuation. Two independent `FILE_LINE` matches on one line are a distinct case — both FIRE, each checked against `EXEMPT` independently, same as cell 3's outcome but via a different code path (two separate regex alternations matching, not one `FILE_LINE` plus one `CONTINUED`). |
| 34 | Same-line basename collision at an exempted line: `node_modules/x/expect.js:12486 and src/expect.js:12486` | **Duplicate of existing cell 21** (two identical hits on one line share one occurrence-blind identity). Codex's version uses two different real path prefixes that both strip to the identical hit string — same mechanism, same disposition: declared residual, needs an occurrence index in the identity tuple, out of scope for this doc-only phase. |
| 35 | A citation immediately adjoining a URL token: `https://x.test),foo.js:3` | **Real gap, new cell.** `URL = /[a-z][a-z0-9+.-]*:\/\/\S+/gi` matches greedily to the next whitespace, so it can consume a genuine citation glued onto a URL with no space between them, turning a real breach into a false SILENT. Not previously disclosed anywhere in the header's "WHAT THIS CANNOT CATCH" list or in this contract. |
| 36 | Nested `.githooks/` path: `.githooks/subdir/pre-commit:36` | **Real gap, new cell.** `HOOK`'s `NAME` component excludes `/`, so a `.githooks/` citation with any subdirectory between the root and the filename does not match `HOOK`, and does not match `FILE_LINE` either (no bare `name.ext` immediately precedes the colon — `pre-commit` has no `.githooks`-style extension). Result: SILENT, an undisclosed gap distinct from cell 24 (which covers `.githooks/` as a citing-file location, not a target path shape inside a citation). |

New matrix rows, added for traceability:

| # | Cell | Verdict | Why |
|---|---|---|---|
| 31 | orphaned continuation, no prior `FILE_LINE` on the line (`,:12` alone) | **FIRES (undisclosed)** | `CONTINUED` has no lookback requirement. A gate maintainer reading only the header would not expect a bare `,:12` to be a breach; it is one today. |
| 32 | two independent full `FILE_LINE` citations on one line, no comma between them | FIRES (both, independently) | Two separate regex-alternation matches; each checked against `EXEMPT` on its own `hit`. No new mechanism beyond cell 3/21's occurrence-blindness, but the SHAPE (no comma) was previously unenumerated. |
| 33 | citation glued to a URL with no separating whitespace | **SILENT (undisclosed false-negative)** | `URL`'s `\S+` eats past the URL's own end into the adjoining citation before `CITATION` ever runs. |
| 34 | `.githooks/<subdir>/<name>:<span>` | **SILENT (undisclosed)** | Neither `HOOK` nor `FILE_LINE` matches a nested hook path; distinct from the already-disclosed "`.githooks/` as citing location" gap (cell 24). |
| 37 | `file:line:column` form (`foo.js:12:7`) or a malformed suffix on the span (`foo.js:12-`, `foo.js:12abc`) | **FIRES, but with a TRUNCATED hit (`foo.js:12`), and this creates a false-EXEMPT edge distinct from cell 16/26** | Found by a second `codex exec` pass (round 2). `SPAN` (`[0-9]+(?:-[0-9]+)?`) has no right-hand boundary, so the match simply stops after the digits — `:7` (or `-`, or `abc`) is left in the line, unmatched and unreported. Two consequences: at a NEW location this fires with a hit that silently drops real information (a column number, or evidence the citation is malformed) from what gets logged as the breach. At a location already EXEMPT for the truncated `foo.js:12`, appending `:7` later (turning a line citation into a line:column citation, which is a real edit to what is being pointed at) does not change the `hit` string at all — `isExempt()` still matches, so the exemption silently survives an edit to the thing it excuses. This is the SAME failure shape as cell 16 (re-target at a fixed citing location) but triggered by right-side truncation of the SPAN rather than left-side truncation of the NAME, so it gets its own cell rather than being folded into 16 or into cell 26 (which is left-side/basename truncation only). |

## (f-cont) Further failability gaps, from the same second round-1 pass

The original four-step Partner-4 design in (f) tests one thing well — a broken
comparison inside a shared predicate — and codex is right that it stops there. Eleven
distinct ways the gate's exit decision could still go silently green are not caught by
that design. Recorded verbatim from the review, then dispositioned:

| # | Finding (codex's wording, condensed) | Caught by (f) as written? | Disposition |
|---|---|---|---|
| 1 | `process.exit(1)` deleted, changed to `process.exit(0)`, or made unreachable | **No.** Partner 4 tests `hasBreach()`'s return value, never the actual `process.exitCode`. | **New partner needed: an END-TO-END subprocess run.** Spawn the real script (`node tests/cite-audit.mjs`, non-self-test mode) against a throwaway fixture tree containing one deliberate, unexempted breach, and assert the CHILD PROCESS's own exit code is 1 and stderr names the breach — not a unit-level call into an exported function. |
| 2 | Production call passes the wrong value (`hasBreach([])`, `audit([])`, empty reader) while `hasBreach()`/`audit()` themselves test green | **No.** | Same end-to-end partner as #1 — it exercises the real call chain from `scanFiles()`/`readFileSync` through to exit, not a substitute. |
| 3 | Production branch stops calling `hasBreach()` at all | **No.** | Same end-to-end partner — if the real script never reaches the predicate, the subprocess still exits 0 despite the seeded breach, and the partner catches that regardless of what the predicate itself would have said. |
| 4 | Self-test's own exit hard-wired green (`process.exit(0)`, `all = true`, Partner 4 omitted from `all`) | **No** — this attacks the self-test harness itself, one level up from anything in (f). | **New meta-check, enforced OUTSIDE `tests/cite-audit.mjs`:** the CI step that runs `--self-test` must assert on the CHILD PROCESS exit code of THAT invocation too (`node tests/cite-audit.mjs --self-test; test $? -eq 0`), and, separately, a one-time manual proof (recorded in the build PR, not re-run every CI pass) that forcing `all = true` while a seeded partner is FAIL makes the self-test's own process exit 1 despite the printed FAIL line — i.e., prove the print and the exit code cannot be pried apart. |
| 5 | `isExempt()` weakened to a projection of the full key (file+line only, file+hit only, line+hit only, file only, hit only) | **No.** Partner 3 only proves POSITIVE liveness of the real table; it never proves the key needs all three fields. | **New partner: an identity truth table**, matching the obligation already recorded in (g-cont) above — exact triple passes, each single field changed on its own fails, all five weakenings tested explicitly rather than left as an implication of Partner 3. |
| 6 | `scripts` and `astro.config.mjs` silently dropped from `ROOTS` | **Partially — the FLOOR check would likely still pass**, and NAMED only checks 3 specific files, none of which sit under `scripts`. | **Strengthen Partner 2: name at least one file from EVERY root**, not three arbitrary files — add a `scripts/*` file and confirm `astro.config.mjs` itself (already NAMED, so this one is actually caught — codex is right about `scripts`, not fully right about `astro.config.mjs`; corrected here rather than accepted uncritically). |
| 7 | `SCANNED` narrowed to `js\|mjs\|css` (dropping `astro`, `cjs`, `ts`, `html`) | **No** — FLOOR and NAMED both still pass; none of the three NAMED files require `.astro`/`.ts`/`.html` coverage specifically enough to catch this. | **Strengthen Partner 2 further: name one file per extension in `SCANNED`**, not just per root — the two obligations (per-root, per-extension) are related but not identical and both are needed. |
| 8 | `TARGETS` narrowed (dropping `cjs`, `astro`, `md`, `json`, `yml`, `html`) | **No** — the four `finds` fixtures only exercise `.css` extensions. | **Strengthen Partner 1: one `finds` fixture per `TARGETS` extension**, not four arbitrary ones — turns the implicit "the pattern accepts these extensions" claim into an explicit, enumerated assertion. |
| 9 | `git ls-files -co` narrowed to tracked-only (dropping `--others --exclude-standard`, i.e. losing untracked-file coverage) | **No** — no partner requires an untracked file to be scanned. This is the exact class the scanner's own header calls out as a real, previously-fixed defect ("scanning only tracked files reported 144... the file missing from mine was this one, still unstaged"). | **New partner: an untracked-fixture check.** In the end-to-end fixture tree from #1, the seeded breach file must be `git add`ed but NOT committed (or entirely outside `git add`, exercising `--others`), and the partner must fail if narrowing to tracked-only would have hidden it. This directly re-guards the regression the header documents having already hit once. |
| 10 | A named subtree quietly excluded (e.g. `src/data/`) while `ROOTS` keeps its top-level entries | **No** — (f)'s only ROOTS mutation is total collapse to `['docs']`; a partial exclusion inside `src/` is invisible to the FLOOR/NAMED checks. | **Declared residual, not designed here.** Closing this needs either a much larger NAMED set (impractical to enumerate every meaningful subtree) or a structural check (e.g. asserting `scanFiles().length` against a value derived from `git ls-files` directly in the partner, so the partner and the scanner can't drift together) — a code-design decision, correctly deferred to the build phase rather than settled in this contract. |
| 11 | CI wiring masks the real exit code — running only `--self-test` in CI (never the real scan), or piping the real invocation through `\|\| true` | **No — and cannot be, from inside `tests/cite-audit.mjs` itself.** This is a wiring defect, not a scanner defect. | **Out of scope for the script's own self-test; in scope for the build phase's CI-wiring check.** The build PR must show the exact `gates.yml` step invoking the script WITHOUT `--self-test` and WITHOUT any exit-code-swallowing (`\|\| true`, `continue-on-error: true`), the same way D165's sweep was proved comments-only by running a checker over the real diff rather than asserting it in prose. |

Items 6–8 sharpen rather than merely restate Partner 2/1 — the original design in (f) never
claimed extension- or root-completeness at all, so these are net-new obligations, not
missed mutations of an existing one.

## (e) What is out of scope

**`docs/` prose is entirely out of scope for this gate**, on the owner's explicit
2026-08-27 ruling recorded in the scanner's own header: *"DEF-71 is sweep-and-gate on
CODE ONLY."* `ROOTS` is `['src', 'tests', 'scripts', 'playwright.config.js',
'astro.config.mjs']` — no `docs` entry, and the header states this is deliberate, not an
accident of globbing.

This matters because D165's row records 303 citations swept from `docs/` (an inherited
figure) against 333 measured under this file's own pattern at the same commit, and
"MEASURED 2026-08-31... 451 citations... across 80 tracked docs/*.md files" still sitting
in `docs/`, untouched, unswept, ungated. **This gate does nothing about any of them, and
will not fire if a new one is added tomorrow.** That is not a bug in this gate — it is
the ruling's scope, restated so a future reader does not "discover" it as a gap and
propose widening the gate without going back to the owner first, which the header itself
flags as unrequested scope.

Also out of scope, all disclosed already in the scanner's own header and reproduced here
so this contract does not silently contradict it:

- **Truth-checking a surviving file-only citation.** This is a pointer-FORM check only.
  `global.css` is cited as "451 lines" in two files while `wc -l` says 500 — a live,
  undisputed example of a stale FACT this gate is structurally blind to (DEF-78).
- **Prose forms** — `"file.ext line 82"`, `"#L82"`. Widening to these is unrequested scope.
- **`.github/workflows/` and `.githooks/`** — zero citations today; prospective, not live.
- **Extensionless external paths** (e.g. the NarraTwin ADR reference in
  `file-budget.mjs`) — nothing in-repo to key an exemption on.
- **A source extension absent from `SCANNED`** (`.jsx`, `.svelte`) — silent skip until
  someone deliberately adds the extension to the list.
- **Erosion** — deleting a cross-reference passes as cleanly as reducing it to a
  filename; nothing counts citations over time. `ADVISORY_DEBT`, not a blocker.
- **Npm-package look-alikes (cell 21 above)** — newly identified in this contract, not
  previously in the header's list. Recommend adding to the header's disclosure when the
  gate is built, but it does not by itself block writing the gate — false positives on a
  version-pin comment are a nuisance (over-firing), not a false-accept.

## (f) The failability partner design

**What the current self-test does NOT do:** partners 1–3 all exercise `citationsIn()`,
`scanFiles()`, and `readFileSync()` directly. None of them ever call `audit()`, and none
of them ever reach the script's own `if (breaches.length) { ...; process.exit(1); }`
block — the actual decision that makes the gate a gate. That block only runs on the
NON-`--self-test` code path. This is exactly how `breaches.length` → `breaches.lenght`
stayed invisible: the typo lives in a branch the self-test structurally cannot enter.

**The fix is not "add a fourth partner that also prints PASS."** It has to be an
assertion that FAILS specifically when the gate's own exit decision is broken, and PASSES
otherwise — a partner with a bite, not a partner with a report.

Design, not implemented here:

1. **Partner 4 — the exit decision itself, driven with a live control.** Call `audit()`
   directly (bypassing `--self-test`'s narrower seam) with a virtual file list and a
   virtual `read()` that returns one line containing an unexempted citation
   (`'controlled-breach.js:1'` — a string that exists ONLY in this fixture, never in the
   real tree, so it cannot coincidentally get exempted). Assert `breaches.length === 1`
   too, but that alone is not the fix — the important assertion is on **the same
   condition the real script uses to decide exit code**, not a hand-rolled restatement of
   it. Concretely: extract the pass/fail decision into a named, exported predicate (e.g.
   `hasBreach(breaches)`) that BOTH the self-test and the bottom-of-file real run call —
   so a typo in that ONE place breaks both the real gate and the self-test's assertion of
   it identically. Two independent copies of the same condition (one in the self-test,
   one in the real exit path) is exactly the shape that let `.lenght` hide: the self-test
   checked its OWN condition, not the gate's.
2. **The mutation, named explicitly, per this repo's own standard ("every gate ships a
   failability partner").** RED-WHEN: rename `breaches.length` to `breaches.lenght`
   inside the shared `hasBreach` predicate (or wherever the real exit condition lives).
   Partner 4 must go RED. Partners 1–3 are permitted to stay green under this exact
   mutation — that is the diagnostic point: if 1–3 stay green under this mutation, they
   were never testing the thing that broke, which is the D164 finding restated as a test
   design rule rather than a prose warning.
3. **A second mutation for the same partner, hard-wired-true.** RED-WHEN: replace the
   predicate's body with `return false;` (gate always claims "no breach" regardless of
   input). Partner 4 must go RED. This catches the "hard-wired true" class named in
   `docs/practices/autonomous-run.md`'s failability-partner rule, distinct from the typo
   class — a typo corrupts one comparison; a hard-wire removes the comparison entirely,
   and a partner that only catches one is not proven to catch the other.
4. **A third mutation: scan root pointed outside coverage.** RED-WHEN: change `ROOTS` to
   `['docs']` (a root the fixture's virtual files are never placed under, or — for a
   file-system-driving variant — literally not containing `controlled-breach.js`).
   Partner 4 (run against the REAL `scanFiles()`, not the virtual seam, for this one
   variant) must go RED, proving the self-test would notice a scan root silently
   redirected away from the code it is meant to cover — the third named failure mode in
   the repo's own failability-partner rule ("a scan root pointed outside the code it is
   meant to cover").
5. **Confirm the restore.** After each of the three mutations above is applied and
   Partner 4 is shown RED, the file is restored and the full `--self-test` (all four
   partners) is shown green again, with `git diff --stat` clean — the same
   restore-and-confirm discipline D169 used for `painted()`'s mutation proof.

This directly answers "what makes the gate itself capable of failing, with a partner
proving it": Partner 4 is that partner, and its bite is proved by three separate
mutations against the shared exit-decision predicate, not by a fourth flavor of "PASS —
the scanner bites" printed from a code path the typo never touches.

## Adversarial review record

Two rounds of `codex exec --sandbox read-only` (static-analysis-only, cannot run code),
2026-08-31. Literal findings, not a summary:

- **Round 1** (23 findings against the base matrix): real matrix gaps incorporated as new
  cells 21-27 in `(d-cont)` above (same-line duplicate hits, unscanned roots, markdown
  inside an in-scope root, host:port false-positive class, generalized `NAME`-character
  collision, target-existence irrelevance stated explicitly). Failability-only findings
  (14-19, and 20 of the 23) recorded as fixture obligations in `(g-cont)` rather than
  matrix cells — they name missing proof, not missing verdicts.
- **Round 2** (run against the FULL file including round-1's additions): one new finding,
  the orphan-continuation false positive, incorporated as cell 28. No other gap named.

**Continued in a later pass of this same session, three more rounds, because the note
above correctly flagged the file as one round short of the literal convergence bar:**

- **Round 3 of the overall sequence** (labelled "round 1" in its own prompt, since the
  reviewer was given the file fresh): 5 matrix findings, 11 failability findings.
  Matrix findings — orphaned continuation `,:12` with no prior citation, two independent
  full citations on one line without a comma, same-line basename collision at an
  exempted line (duplicate of existing cell 21, dispositioned as such), a citation glued
  to a URL with no whitespace, and a nested `.githooks/<subdir>/` path — incorporated as
  new cells 31–34 in `(d-cont-2)`. The same-line-collision finding was recognized as a
  restatement of the earlier round's cell 21 and NOT double-counted as a new cell.
  Failability findings — real end-to-end exit-code testing, production-call
  disconnection, self-test's own hard-wire, `isExempt()` key-projection weakening,
  per-root/per-extension coverage narrowing, untracked-file coverage narrowing, partial
  subtree exclusion, and CI-wiring masking (`--self-test`-only, `\|\| true`) — all eleven
  incorporated in `(f-cont)`, each dispositioned as either a new required partner, a
  strengthening of an existing one, a declared residual, or explicitly out of scope for
  the script itself (CI wiring).
- **Round 4 of the overall sequence** ("round 2" in its own prompt, run against the FULL
  file including round 3's additions): one new finding — `file:line:column` form
  (`foo.js:12:7`) and malformed span suffixes (`foo.js:12-`, `foo.js:12abc`) fit no
  existing cell, because `SPAN` has no right-hand boundary and truncates silently,
  creating both an information-dropping FIRES and a false-EXEMPT-survives-an-edit case
  distinct from cell 16. Incorporated as cell 37 in `(d-cont-2)`. No failability finding.
- **Round 5 of the overall sequence** ("round 3" in its own prompt, run against the FULL
  file including cell 37): **nothing new in either category.** Quoted in full: *"No
  citation-shaped string falls outside the existing matrix. No new silent-green exit
  failure exists beyond (f) and (f-cont)... Round 3 is clean."*

**Convergence reached at the fifth codex round of this document's life** (the third
consecutive round with a FULL-document, from-scratch prompt to produce nothing new,
counting the file's own internal round numbering as 1/2/3 for that final sequence). All
labelled `codex exec --sandbox read-only`, static-analysis-only throughout — it cannot
run code, only read source and reason about it, and it is what found every real gap in
this document, none of them by this document's own author on first pass.

