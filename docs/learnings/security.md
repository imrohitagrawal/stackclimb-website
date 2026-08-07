# Security & publishing

### L-SEC-1 — Going public exposes strategy, not just code

**Where introduced:** planning · **Where caught:** scanning before flipping visibility
**Cost:** none — caught in time.

**What happened:** `PRODUCT.md` carried "Success is an inbound message about a role" and "other
candidates open in other tabs". `AGENTS.md` carried a rule saying the hiring goal must stay
hidden — a sentence that leaked the strategy by naming it.

**Rule:** before making a repo public, grep the working files and the commit history for intent,
strategy, and success metrics — not only for secrets. The sentence protecting a strategy is often
the sentence that reveals it.

### L-SEC-2 — No LICENSE file means nobody may legally use it

**Where introduced:** publishing · **Where caught:** provenance audit
**Cost:** `project-doc-skills` is public and reusable by nobody. `karpathy-skills` has the same
defect at 200,000 stars.

**What happened:** the repo has `shared/licensing-and-credits.md`, a thorough standard for
licensing the documents its skills *produce*. It has no licence on the skills themselves. The
only `LICENSE` in the tree is a demo fixture at `examples/doc-critic-demo/LICENSE`.

**Rule:** publishing is not permission. Under default copyright, code with no licence is all
rights reserved — GitHub's terms grant viewing and forking on GitHub, nothing more. Attribution
does not substitute: attribution is what a licence *requires*, not what creates one. A public
repo intended for reuse ships a `LICENSE` at its root.
