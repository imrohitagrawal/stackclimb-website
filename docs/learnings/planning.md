# Planning & requirements

### L-PLAN-1 — Read `main`, not whatever branch happens to be checked out

**Where introduced:** planning · **Where caught:** the owner corrected me
**Cost:** a confidently wrong answer, twice, on a rule that governs every file in the project.

**What happened:** I searched for a file-size rule across the sibling repos and reported none
existed. CiteVyn was on `fix/215-citation-validator`; NarraTwin's main worktree was on
`phase-1-closure-process-338-…`; `ch11` was a detached HEAD. The rule was there on `main` —
`docs/ADR/0047-publication-boundary.md:55`, capping modules at 250 lines / 32,000 bytes /
120 chars.

**Rule:** read the default branch explicitly — `git show main:<path>`, `git grep <pat> main`.
A working tree is one developer's in-flight state, not the project's position. Check
`git rev-parse --abbrev-ref HEAD` before drawing any conclusion from a repo.

### L-PLAN-2 — Scope a claim to what was actually checked

**Where introduced:** planning · **Where caught:** the owner corrected me
**Cost:** told the owner he had no engineering skills. He had been using Addy Osmani's, GitHub
Spec Kit, and Paweł Huryn's PM skills for months, all recorded in `docs/SKILL_LOCK.md`.

**What happened:** I checked one file — this project's `skills-lock.json` — and stated a
conclusion about all his projects.

**Rule:** a claim inherits the scope of its evidence. If one file was read, the claim is about
one file. Say which file.

### L-PLAN-3 — Verify the scope of a change before promising it is small

**Where introduced:** planning · **Where caught:** running the scan before acting
**Cost:** nearly published a repo carrying its own strategy.

**What happened:** I told the owner that making the repo public needed "one reworded line" in
`AGENTS.md`. A scan found four lines across three files, and `PRODUCT.md` was more explicit than
`AGENTS.md`.

**Rule:** never state the size of a change from memory of writing it. Grep first, then say.
