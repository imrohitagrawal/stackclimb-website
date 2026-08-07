<!--
Plain English throughout. No jargon.
A reviewer who has never seen this code should be able to check it from this description alone.
-->

## What was expected

<!-- The requirement, in one or two sentences. What should be true after this? -->

## Behaviour before

<!-- What happened previously. Be concrete: what a user saw, what a command returned.
     Include the actual output or a screenshot. "It was broken" is not a description. -->

## Behaviour after

<!-- What happens now. Same concreteness. Include the new output or screenshot. -->

## What changed, and why

<!-- NOT "modified Plate.astro". For each change:
     - what the change is
     - what it is FOR
     - how it produces the behaviour above

     Example:
     `Plate.astro` — each plate now carries `style="--plate-hue:<hue>"`.
     Previously the hue was only a data attribute, so nothing painted a background
     until JavaScript ran. Now the ground is in the static HTML, which is why the
     plate is readable with JS off. -->

## How to check it yourself

<!-- The exact commands, and what a correct result looks like.
     A reviewer must be able to reproduce this without asking a question. -->

```bash
```

## What the reviewer should focus on

<!-- Name it. "Please review" wastes the reviewer.
     - Which behaviour to verify by hand
     - Which edge case is most likely to be wrong
     - Which part you are least sure about
     - What you did NOT test, and why -->

## Risk and rollback

<!-- What breaks if this is wrong, and how to undo it. -->

## Checklist

- [ ] A test fails without this change — proven by reverting it
- [ ] Visual changes have been **looked at**, desktop and mobile
- [ ] Both states checked where one exists (JS on/off, both themes)
- [ ] No test weakened, skipped, or threshold lowered
- [ ] New claims trace to `docs/evidence/` at VERIFIED or labelled REPORTED
- [ ] `docs/STATUS.md` updated in this change
- [ ] Learning filed under the phase that **introduced** the problem, if any
