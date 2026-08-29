// /how-i-build — RCA-014 item 3. The third `model-band` (the one whose
// `.band-term` sits directly inside `.band-lead`, not `.band-support`) got
// only a 100-unit font-weight jump (600 lead -> 700 term) instead of the
// 300-unit jump every other `.band-term` gets, because its parent's own base
// weight is 600 rather than `.band-support`'s uninherited 400. Archivo
// Variable renders both jumps distinctly (confirmed in RCA-014, the
// phantom-font-fallback theory was tested and refuted) but a 100-unit jump on
// text that already reads semi-bold does not read as emphasis.
//
// WHICH CHANGE TURNS IT RED: reverting the `.band-lead .band-term`
// font-weight override back to the bare `.band-term` value (700) reproduces
// the exact 100-unit gap this test measures against the other six
// `.band-support`-nested instances' 300-unit gap.

import { test, expect } from '@playwright/test';

test('the how-i-build plate\'s lead-nested band-term matches the other instances\' weight jump (RCA-014)', async ({
  page,
}) => {
  await page.goto('/how-i-build');

  // Codex review round: two of the five bands carry TWO .band-term spans in
  // the same .band-support paragraph ("explicitly not blind human labels"
  // AND "alert on a floor breach" in one; "before it leaves the process" AND
  // "labelled full-eval" in another) — querySelector() on the band only
  // checked the first of each pair, silently leaving 2 of 7 real instances
  // unverified. querySelectorAll() checks every instance in every band.
  const bands = await page.evaluate(() =>
    [...document.querySelectorAll('.model-band')].flatMap((band) =>
      [...band.querySelectorAll('.band-term')].map((term) => {
        const parent = term.parentElement;
        return {
          parentClass: parent.className,
          parentWeight: Number(getComputedStyle(parent).fontWeight),
          termWeight: Number(getComputedStyle(term).fontWeight),
        };
      }),
    ),
  );

  expect(bands.length, 'expected all 7 band-term instances on /how-i-build').toBe(7);

  const MIN_JUMP = 300; // RCA-014's own floor, exact: "at least 300 units above
  // its immediate parent's computed weight" — every .band-support instance
  // clears exactly 300 (400 -> 700), so 300 catches a regression to the
  // 100-unit defect without loosening the floor below what already ships.
  const faults = [];
  for (const b of bands) {
    const jump = b.termWeight - b.parentWeight;
    if (jump < MIN_JUMP) {
      faults.push(
        `.band-term inside .${b.parentClass}: parent ${b.parentWeight} -> term ${b.termWeight} ` +
          `(jump ${jump}, floor ${MIN_JUMP})`,
      );
    }
  }
  expect(faults, faults.join(' · ')).toEqual([]);

  // The specific defect: the one instance nested in .band-lead (lead itself
  // is 600) must not be the odd one out at a smaller jump than its siblings.
  const leadNested = bands.find((b) => b.parentClass.includes('band-lead'));
  expect(leadNested, 'no band-term is nested inside .band-lead on /how-i-build').toBeTruthy();
  const supportJumps = bands
    .filter((b) => b.parentClass.includes('band-support'))
    .map((b) => b.termWeight - b.parentWeight);
  const minSupportJump = Math.min(...supportJumps);
  expect(
    leadNested.termWeight - leadNested.parentWeight,
    'the .band-lead-nested term must jump at least as much as the .band-support instances',
  ).toBeGreaterThanOrEqual(minSupportJump);
});
