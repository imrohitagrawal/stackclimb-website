# RCA register

One file per finding, written **before** the work that addresses it. The rule and its worked
example are in `AGENTS.md` under "document and get approval before changing".

Naming: `RCA-<nnn>-<slug>.md`, numbered in the order raised.

| # | Finding | Status |
|---|---|---|
| 001 | Watermarking is specified but no skill applies it | Awaiting approval |

## What every RCA carries

- **What is missing or went wrong**, with file and line
- **Where introduced** and **where caught** — the gap between those two is the missing gate
- **The cost**, including "zero so far" and what the cost becomes if it is left
- **Why now**
- **A public-alternatives search**, if the fix is a new skill — required by `AGENTS.md`
- **Open questions** for the owner
- **A decision line**, unapproved until he approves it

An RCA without a cost and without a plain-English explanation is a task description, not an RCA.
