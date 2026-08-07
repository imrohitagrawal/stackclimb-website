# Two agent harnesses, deliberately crossed

`VERIFIED` — CiteVyn and Quorum-AI each carry **both** `AGENTS.md` (Codex) and `CLAUDE.md`
(Claude Code), and **both** `.agents/skills/` and `.claude/skills/` trees.

`VERIFIED` — the `CLAUDE.md` files are thin pointers that import `AGENTS.md` via `@AGENTS.md`,
keeping one source of truth across two harnesses. This repo now uses the same pattern.

`REPORTED` — stated intent: run Codex over Claude Code's output and Claude Code over Codex's, so
each reviews the other's work instead of grading its own homework.

## Open thread — do not publish yet

`UNVERIFIED` — the mechanism is not yet traced to an artifact proving a cross-review *ran*.
Both harnesses being configured is not the same as both having reviewed.

Where to look next:
- `quorum-ai/*ULTRACODE-PROMPT.md` and their paired `*RESULT.md` files at repo root
- PR templates and review transcripts
- `quorum-ai/docs/factory/` — the factory runbook may describe the handoff

## Why it matters

"How do you trust AI-written code?" is the question every hiring manager in this space is
asking. Independent adversarial review is a real answer, and most candidates answer with a shrug.
