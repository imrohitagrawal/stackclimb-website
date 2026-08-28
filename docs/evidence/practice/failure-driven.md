# Engineering driven by named failures

`VERIFIED` — `quorum-ai/.github/workflows/deploy-drift-watchdog.yml` opens with the incident that
caused it:

> "It fixes the failure mode we hit on #54: main got a new commit but no deploy fired (a dropped
> Actions event / skipped-or-failed deploy gate / a flake), leaving prod stale with no one watching."

Then bounds its own honesty:

> "WHAT IT CHECKS (honest scope), two independent questions:
>
> 1. Does main HEAD have a SUCCESSFUL "Deploy to Fly.io" run — the deploy JOB, not a `/health`
>    200 (per the deploy-job-skip-vs-health lesson)? This is a PROXY: it cannot see a Deploy run
>    that reported success while production did not actually roll, and it does not track an
>    out-of-band local `flyctl deploy` (if one happened it re-triggers a pipeline that just
>    redeploys the same code — idempotent, harmless).
> 2. Does `/status.build_sha` actually EQUAL main's tip? [...] This is the direct question, and
>    the only one that catches a merge which triggered no workflow at all — on 2026-08-07 that
>    left production 34m31s behind while every passive probe stayed green."

Three things at once: a real incident named, a transferable lesson encoded (*a healthy `/health`
does not prove the deploy ran*), and an explicit statement of what the tool does **not** cover.
The site's entire thesis, appearing unprompted in a CI comment nobody was meant to read.

`VERIFIED` — cost consciousness in the same file: *"COST-FREE self-healing deploy watchdog
(Actions is free/unlimited on this public repo)."*

## Supersede-don't-delete, with an audit

`VERIFIED` — `quorum-ai/docs/day-one-quality-standard.md` is a 31-line pointer stub to
`docs/DAY-ONE-PROMPT.md`, kept so existing links survive, recording that *"a carry-forward audit
(every pointer here ∈ the canonical file) was run at consolidation time."*

`VERIFIED` — `quorum-ai/tests/test_day_one_carry_forward_audit.py` exists, so the audit is enforced
by a test rather than by intention.
