// RCA-016 (P6), 2026-08-30: the card this pin guards is now GENERATED from the
// built home page by scripts/og-card.mjs, then watermarked by the same hand
// step as before. The previous card drifted for weeks — it shipped a bio, two
// CTA labels ("WHAT HE BUILT", "CV") and an evidence device the site had
// replaced, because nothing connected the asset to the page. Generation removes the
// gap that allowed it: the card's strings are the build's strings when it is
// rendered, and tests/og-card-contract.spec.js fails the moment a string it
// recorded stops appearing in the built page. It does NOT make every kind of
// staleness impossible — a card never regenerated after a copy change still
// ships until that gate is run, which is why the gate runs in CI.
// The pin below still guards the SHIPPED BYTES, which the watermark step
// produces by hand and which no generator writes.
//
// public/og.png must carry the credit watermark applied once, by hand, via
// project-doc-skills' watermark skill (W-20/RCA-001) — never regenerated at
// build time (og.png is a static asset; the skill needs Pillow, which this
// site's Node-only CI does not carry, and DEF-37/the dropped-PDF-plan record
// why adding a Python dependency to solve a one-time asset problem is the
// wrong trade). A pinned hash is the same "golden file" pattern this repo
// already uses for visual baselines (visual-baselines.spec.js): the pin is
// anchored to a file that was VISUALLY inspected (screenshot, this session)
// before being committed, not asserted blind.
//
// TO REGENERATE (og.png redesigned, or the credit line/opacity changes):
//   python3 ~/Projects/project-doc-skills/skills/watermark/assets/apply_watermark.py \
//     public/og.png OUT.png --text "Rohit Agrawal · https://www.linkedin.com/in/rohitagrawal14/"
//   Look at OUT.png (per the repo's own "never report a visual change
//   without looking at it" rule) before replacing public/og.png, then:
//   shasum -a 256 public/og.png   # paste the new hash below.
//
// WHICH CHANGE TURNS IT RED: og.png reverted to its pre-watermark original,
// replaced with any other file, or corrupted — any byte change at all.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const EXPECTED_SHA256 = '88a9e848fde02436bca1a396307978915cce89dc0ab308c774fb7e294246b785';

test('public/og.png is the visually-verified watermarked file, byte for byte', () => {
  const buf = readFileSync('public/og.png');
  const hash = createHash('sha256').update(buf).digest('hex');
  expect(hash, 'og.png does not match the pinned, visually-verified watermarked file').toBe(
    EXPECTED_SHA256,
  );
});

test('dist/og.png (the built, served file) matches the same pin', async () => {
  const buf = readFileSync('dist/og.png');
  const hash = createHash('sha256').update(buf).digest('hex');
  expect(hash, 'the built og.png differs from public/og.png — the static copy step dropped it').toBe(
    EXPECTED_SHA256,
  );
});
