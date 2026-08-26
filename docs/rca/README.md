# RCA register

One file per finding, written **before** the work that addresses it. The rule and its worked
example are in `AGENTS.md` under "document and get approval before changing".

Naming: `RCA-<nnn>-<slug>.md`, numbered in the order raised.

| # | Finding | Status |
|---|---|---|
| 001 | Watermarking is specified but no skill applies it | Done 2026-08-17 (W-20, D90) |
| 002 | `.js-ground` fails open | Refuted 08-09 — the class had no consumer; superseded by 003 (DEF-6) |
| 002 | Proof language: verification vocabulary where reader meaning belongs | Shipped 2026-08-14 (D85). The number was reused by mistake; both files keep it |
| 003 | The fixed nav has no ground | Fixed 08-09 (DEF-38) |
| 004 | The mobile nav reaches nothing | Fixed 08-09 (DEF-42, D46) |
| 005 | The employer ledger shipped scoped to one tenure while depicting the career | Shipped 2026-08-15 (D87) |
| 006 | `PRODUCT.md` lags three rulings the site already honours | Done — part 1 2026-08-26 (D128), part 2 and the six-fact refresh 2026-08-27 on the owner's word (D134) |
| 007 | Line numbers written into comments — 24 of 42 already point at the wrong line | DEF-67's three fixed 2026-08-27 (D138); the other 21 and the gate await the owner |
| 008 | `/cv` has no plate-height coverage, and closing it needs three decisions, not one | Blocker 1 fixed 2026-08-27 (D139); the ceiling is a design-system amendment and waits on the owner |

*Index brought current 2026-08-26: it listed only 001, as "awaiting approval", nine days after W-20
marked it done, and none of 002–005. Statuses above are taken from the ledger rows named, not from
memory.*

## What every RCA carries

- **What is missing or went wrong**, with file and line
- **Where introduced** and **where caught** — the gap between those two is the missing gate
- **The cost**, including "zero so far" and what the cost becomes if it is left
- **Why now**
- **A public-alternatives search**, if the fix is a new skill — required by `AGENTS.md`
- **Open questions** for the owner
- **A decision line**, unapproved until he approves it

An RCA without a cost and without a plain-English explanation is a task description, not an RCA.
