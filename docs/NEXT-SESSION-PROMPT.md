# Next session — the standing autonomous prompt (P-11, then close the register)

ultracode

You are continuing work on stackclimb.com, the owner's personal site.
`/Users/rohitagrawal/Projects/designing-website`. Astro, static, Cloudflare Pages.
DEPLOYMENT IS APPROACH C: a merge to main deploys automatically through CI and verifies
production itself (gates.yml deploy job). Never run manual wrangler unless the CI deploy
job fails — break-glass only. **W-24 (owner, 2026-08-15): merge each PR autonomously once
it is verified and green — the merge is delegated, owner-reserved judgment calls are not.**

READ FIRST, IN THIS ORDER, AND DO NOT SKIP:
  AGENTS.md · docs/STATUS.md rows D96 down through D90 (this session's work, most recent
  first) · docs/OWNER-DIRECTIVES.md (P-9 through P-21, I-4, and W-24 govern all copy and
  all merges) · docs/plan/p9-interactive-resume.md and docs/plan/p10-comments-giscus.md
  (both v2 — read their "Amendments"/R-7 sections, not just "What ships": the mechanism
  that shipped is not what v1 proposed, in both cases) · docs/plan/i4-memory-management.md
  (open questions, unanswered as of this handoff) · docs/evidence/README.md

THEN STOP TRUSTING THEM. Verify by running a command before acting on any row. The ledger
outranks this file. EVERY suite read uses `set -o pipefail` + exit code, never `tail`.

THE RULE THAT MATTERS MOST (D79, extended by RCA-002/RCA-005, reproven twice more this
session): a plan quotes every governing decision CLAUSE BY CLAUSE, BY ROW ID, and a
PLAN-REVIEW FAN BEFORE BUILDING catches real defects that pure inspection misses — P-9's
v1 mechanism (raw links into internal docs, wrong repo name, would have 404'd) was killed
by a 4-lens plan fan before one line of code existed. Do this for P-11 too; it is flagged
as the heaviest remaining item and deserves at least that fan, not less.

== RESOLVED BY THE OWNER THIS SESSION (do not re-open) ==
  - P-9: `/cv` enhanced in place (no new page). Unlinkable claims read `Approximate`
    (not the internal REPORTED/UNVERIFIED taxonomy word). Interactivity is expand/collapse
    per project card, native `<details>`, no JS. SHIPPED, deployed, production-verified
    (D92/D93 — note D93 corrected an earlier draft's guessed `www.stackclimb.com`; the
    real `astro.config.mjs` site value has no `www`).
  - P-10: comments built now, on the 4 `/projects/<slug>` pages (no blog exists to attach
    them to otherwise). GitHub Discussions category is the auto-created `Announcements`
    (locked format), not a custom "Comments" category — no public API creates/renames
    categories, and the name never renders in the widget a visitor sees. SHIPPED, deployed,
    production-verified (D94/D96). **Owner action still open**: install the giscus GitHub
    App at `github.com/apps/giscus` on `stackclimb-website` — comments won't functionally
    post until then; the widget reports this loudly (visible "not installed" text), not
    silently. Check `curl -L https://www.stackclimb.com/projects/citevyn | grep -c
    'giscus is not installed'` — 0 means the App is installed and comments should work;
    if still >0, the owner action is still pending, not a regression.
  - I-4: **plan only, not built**, per the standing instruction. Two questions are sitting
    unanswered in `docs/plan/i4-memory-management.md` — check if the owner has answered
    them since; if not, they are still open and still not yours to decide silently:
    (1) git-init this repo's own memory dir only, or all 10 project memory dirs found
    under `~/.claude/projects/*/memory`; (2) should a consolidation pass auto-commit its
    own edits, or produce a reviewable diff. "Auto-dream" is confirmed NOT a real Claude
    Code feature (checked against the actual docs) — do not build toward it as if it were.
  - W-24: autonomous merges of verified-green PRs, standing.

== THE QUEUE — ONE ITEM LEFT: P-11 (NarraTwin avatar as the site's representative) ==

**Verify the blocker before planning anything — do not assume it has cleared.** Plan
phase 7.3 says P-11 is "Blocked on NarraTwin's own No-Go." Checked fresh at this
handoff's own writing, against `origin/main` (W-1 — never the checkout), not assumed
stale: `git -C ~/Projects/narratwin/narratwin-ai/narratwin-ai fetch origin && git show
origin/main:docs/RELEASE_READINESS_REVIEW.md | head -15` → **still reads "No-Go for
production release... real video export, and public synthetic-media distribution,"
dated 2026-07-01.** Re-run that exact command first; if it still says No-Go, the block
is real and current, not a stale row.

**A genuinely open question to raise with the owner before building, not resolve
silently**: what does "the site's representative" mean while NarraTwin itself stays
No-Go? Two readings are both plausible and lead to very different builds — (a) an avatar
of Rohit himself, generated USING NarraTwin's own tech as a demonstration/artefact
(NarraTwin's deployment status is then irrelevant — it's a proof-of-capability, same
category as the existing project pages' artefacts), or (b) NarraTwin's own persona/avatar
actually representing the SITE (which would need NarraTwin live, i.e. genuinely blocked).
Reading (a) seems far more consistent with how every other "not deployed" system on this
site is already handled (P-17: status disclosures stay honest, the system is shown
anyway, "the gate holding is the point") — but this is exactly the kind of scope
assumption P-9's v1 mechanism got wrong by not checking, so ask rather than guess.

Once the blocker and the reading are both settled: plan autonomously, STOP at genuinely-
owner decisions (matching P-9/P-10's pattern this session — each needed 1-2 real
AskUserQuestion rounds, not more). Full plan-review fan before building (see above);
R-7 Codex pass on any test-file change (mandatory, see below); mutation-test every new
assertion against the SEALED commit; independent production verification after deploy.

After P-11: the register is fully worked. Session-close protocol
(`docs/practices/session-close.md`) applies — this file gets rewritten again at that
point, this time with nothing queued unless the owner adds something.

== HOW TO WORK (durable lessons; this session's additions in caps) ==

  - ONE WRITER. Fan reviews, never construction. NEVER edit the tree while a fan runs.
  - COMMIT BEFORE MUTATION-TESTING — ABSOLUTE. Mutations only against a sealed commit;
    record mutation→red pairs with EXACT MESSAGES in the STATUS row.
  - THE D88 CASCADE-SPECIFICITY BUG RECURRED A THIRD TIME THIS SESSION, in P-10's own new
    CSS, despite being named explicitly twice already. `.plate-copy p` (two selector
    components) beats any bare single-class override regardless of source order — ALWAYS
    scope a new plate-copy override two components deep (`.plate-copy .foo`) from the
    first draft, don't wait to be caught. Also: **axe/a11y contrast checks cannot always
    prove a cascade fix landed** — 0.88 alpha and 0.82 alpha both cleared AA on one ground
    this session, so the "a11y test passes" claim for that fix was false confidence until
    a direct `getComputedStyle` assertion was added. If a fix's whole point is a specific
    computed value, assert the value directly; don't infer it from a downstream gate that
    might not be sensitive enough to see it.
  - THE ASTRO WHITESPACE-COLLAPSE BUG RECURRED TWICE THIS SESSION (P-9 and P-10): text
    immediately before an inline element on the NEXT source line collapses the space to
    zero. `.toContain()` doesn't catch it (the fused string still contains the substring).
    Keep trailing text and the following inline tag's opening `<` on the SAME source line,
    always, in any Astro template — don't wait for a screenshot to catch it.
  - THIRD-PARTY EMBEDS (P-10's giscus): read the actual client source/docs for WHERE it
    reads its config from before writing markup — config landed on the wrong element
    (a div, when giscus reads `document.currentScript.dataset` off the SCRIPT tag) and
    the first test passed anyway because it checked the div, not what giscus actually
    reads. R-7 (Codex) caught this one; a plan fan or direct doc-read would have caught it
    earlier and cheaper.
  - CODEX (R-7 carve-out): one 5-minute `codex exec --sandbox read-only` pass on TEST-FILE
    changes, run in the BACKGROUND (`run_in_background: true`), full output captured to a
    file, read the END of the file (not `tail -N` piped — a large log needs `Read` with
    `offset` near the end, `tail` alone can silently miss the actual verdict block if the
    tool call has its own output-size limits). Found real, blocking-class issues on BOTH
    P-9 and P-10 this session — treat it as load-bearing, not decorative.
  - DEPLOY VERIFICATION PATTERN THAT WORKED WELL THIS SESSION: `gh run watch <id>
    --exit-status` in the background immediately after a push to main, THEN independently
    `curl`/headless-browser the live site yourself once it reports done — never trust the
    CI job's own "verify production" step as the only check (this repo's own D71 history
    is why: a step can print success while shipping a hole).
  - TWO PARALLEL DOCS-ONLY PRs BOTH EDITING `docs/STATUS.md`'s header line WILL CONFLICT
    on merge — this session hit it once (D95's PR and D96's PR both touched the "Last
    updated" line and the same insertion point). Fix: `git fetch && git rebase origin/main`
    on the second branch, resolve by keeping BOTH decision rows (newest-first) and folding
    both facts into one header line, force-push with `--force-with-lease` (safe — it's
    your own unmerged branch), then let CI re-run before merging.
  - STOP and declare if a circuit breaker fires. Stop for genuinely-owner decisions —
    this session asked 4 real AskUserQuestion rounds across P-9/P-10 (label word, page
    scope, interactivity mechanism, Discussions category) and none were wasted; guessing
    on any of them would have meant rebuilding.
  - Close the session properly: summary with numbers, main level with origin, branches
    deleted both sides, ports free, tree clean, fresh handoff here.

== CLAIMS THAT MUST NEVER SHIP ==

Everything in the standing live sweep (D85/D87), plus: never "self-reported" (P-16, any
folded spelling) · never "product studio" (D62) · never "No-Go"/"not deployed" on the
#proof act (P-17) · never "Oracle tenure" on the act (P-21) · never an employer name
ANYWHERE in the act (gated, derived from cv.js orgs) · never a dated span the rows cannot
evidence · never "cross-model critique" (quorum's evidence prescribes "moderated
critique") · never "pre-1.0" for EvalAxis ("private, in progress") · SaafSaans labels are
"live, cached, or no reading" · the thesis says FOUR · never claim NarraTwin is deployed
or its release-readiness has changed without re-verifying against `origin/main` first
(see the No-Go recheck above — a stale claim here is the exact failure mode P-11 exists
to avoid repeating). Nothing except VERIFIED-in-evidence or labelled REPORTED.

== HOW TO WRITE TO THE OWNER ==

Plain English. Lead with the answer; if it is no, the first word is no. Short sentences,
bullets, a concrete example. No jargon, no AI filler. Never re-explain what he has acted
on. Disagree out loud BEFORE complying when evidence contradicts an instruction —
conflict, evidence, your position, an everyday analogy. This session's proof it works
(again): P-9's plan v1 was rejected by its own review fan before build, not after —
raising "this mechanism would 404 and expose internal notes" cost one planning round and
saved a shipped defect.
