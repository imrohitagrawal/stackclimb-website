# Testing

### L-TEST-1 — A substring match is not a token match

**Where introduced:** testing · **Where caught:** verifying before reporting
**Cost:** would have put a tool on the site that the project does not use.

**What happened:** `grep -i arize citevyn` returned 27 hits. All 27 were the word **"summarize"**.

**Rule:** confirm the token, not the substring. Use word boundaries, and read one match in
context before believing a count.

### L-TEST-2 — A scan can measure a state no user ever sees

**Where introduced:** testing · **Where caught:** investigating a failure that would not clear
**Cost:** a gate that stayed red after the defect behind it was fixed.

**What happened:** the a11y test scanned the whole page at scroll position 0. The design repaints
the backdrop as each plate reaches the viewport, so every plate was judged against the *hero's*
ground. It reported 14 violations for a state no visitor encounters.

**Rule:** a check on a scroll-driven, state-driven, or time-driven interface must reproduce the
state a user is in. Otherwise it measures an artefact and its failures cannot be cleared.

### L-TEST-3 — Every check states its denominator and fails on zero

**Where introduced:** testing · **Where caught:** adopted before it bit
**Cost:** none yet — inherited from quorum-ai, where 13 of 21 CI jobs could reach a terminal
status having measured nothing, four of them blocking.

**What happened:** a11y scans, link checks, and visual comparisons all pass trivially over an
empty input set. A misconfigured axe builder returns zero violations *and* zero passes, which is
indistinguishable from success.

**Rule:** every gate reports what it counted and fails when the count is zero. "47 files scanned,
0 findings" is a result. "Passed" is not.
