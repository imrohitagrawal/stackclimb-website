# Review & orchestration

### L-REV-1 — A verdict inherited from one agent is a claim, not a finding

**Where introduced:** review · **Where caught:** the owner pushed back
**Cost:** dismissed a genuinely useful skill suite, and would have skipped the single best-fitting
skill found in the whole evaluation.

**What happened:** an agent reported that `project-doc-skills` had dangling references. It had
read `skills/<name>/` — a build *input*. `house-style.md`, `project-profile.md` and `verify.py`
are copied in by `build-skills.sh`; the product is `dist/*.skill`, a 66 KB zip containing all 16
files. I relayed the verdict without checking the artifact.

**Rule:** test the artifact that ships, not the source that builds it. And a subagent's verdict
carries the status of what it actually ran — relay it as `REPORTED` until independently checked.

### L-REV-2 — A second lens reciting the same standard is not a second opinion

**Where introduced:** review · **Where caught:** an adversarial review of my own routing table
**Cost:** would have installed a reviewer that agrees with the thing it reviews by construction.

**What happened:** I routed `ui-ux-pro-max` as the independent lens over `impeccable`'s output,
justified as "its own heuristics, authored independently". 115 of its 208 rules cite Apple HIG,
Material Design, WCAG, or Core Web Vitals — the same standards `impeccable/reference/audit.md`
checks against. Independently *compiled* is not independently *derived*.

**Rule:** independence comes from a different **method** or a different **remedy space**, not a
different vendor. Ask what the second lens can see that the first structurally cannot.
