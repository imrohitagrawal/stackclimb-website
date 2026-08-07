# Design & architecture

### L-DESIGN-1 — An opacity ramp tuned on one ground fails on the others

**Where introduced:** design · **Where caught:** testing, by axe, months later
**Cost:** 4 of 7 plates ship text below WCAG AA on a site that stakes its credibility on
accessibility.

**What happened:** `DESIGN.md` sets plate prose at 88% of `currentColor` and labels at 62%.
Both were tuned against ink navy `#1b2440`, the darkest ground. On viridian, dusk blue, greyed
mauve and linen the same percentages drop below 4.5:1. 22 nodes fail.

**Rule:** a relative value — an opacity, a `color-mix` percentage, a tint — must be checked
against the *lightest* and *darkest* surface it can land on, not the one it was designed on.
Percentages do not carry contrast guarantees across grounds.
