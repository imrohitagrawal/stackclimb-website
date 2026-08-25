/* DEF-56. How visual-baselines.spec.js takes a screenshot whose SIZE cannot
   change. One concern: the capture mechanism. What is captured, and what
   counts as a catastrophe, stays in the spec file.

   THE DEFECT THIS REMOVES. The spec used to capture with
   `expect(page.locator('#id')).toHaveScreenshot(...)`, which photographs the
   element's own bounding box. A plate one pixel taller produced an image one
   pixel taller, and Playwright rejects a size mismatch BEFORE any pixel
   comparison runs — so the file's maxDiffPixelRatio never executed. Measured
   on this branch against the old capture, with one plate made 1px taller:
   "Expected an image 390px by 1334px, received 390px by 1335px", a hard error
   with no diff image. That cost D111 three CI rounds and left fourteen
   baselines stale by exactly 1px in DEF-55. Under the fixed clip below the same
   mutation produced a pixel comparison the ratio absorbed, and the run passed.

   Everything here takes `page` and returns nothing clever. It is a mechanism,
   not a policy. */

import { expect } from '@playwright/test';

/* The viewport height every capture is taken at, and also the clip height. One
   constant sets both on purpose, so the two cannot drift apart.

   Playwright CLAMPS a clip that exceeds the viewport instead of erroring —
   measured: viewport 390x900 with clip 440x900 returned a 390x900 image, and
   clip 390x1200 returned 390x900 too. A silent clamp would bring the size
   mismatch straight back, which is why assertClipFits() checks the layout
   viewport before every capture rather than trusting this number. */
export const CLIP_HEIGHT = 900;

/* The nav is `position: fixed`, so it sits at the top of the viewport at any
   scroll position and a top-anchored clip always contains all of it. 120px is
   the smallest round number above the tallest nav observed (81px at 390 and
   768; 69px at 1440 desktop, 76px at 1440 mobile), so the bar fills 57-68% of
   the frame and a nav catastrophe stays far above the 0.15 ratio.

   THE FRAME IS NOT NAV-ONLY, and a cross-model review was right to press on
   it: at 390px the bar is 81px of a 120px band, so 39px of the hero behind it
   is in shot, and a deliberate change to the hero's ground can turn nav-390.png
   red. That is not a check going red when a bug is FIXED — it is what every
   pixel baseline does when the page changes on purpose, and the answer is the
   same regeneration the plate captures already need. Shrinking the band to 96px
   was considered and not taken: it trades headroom above an 81px bar for a
   contamination that a 15px bleed does not remove either. The nav's own box is
   measured numerically by tests/geometry.spec.js, which is where a nav-only
   answer belongs.

   WHY THE NAV IS CONVERTED TOO and not left as an element crop: its height is
   derived from text metrics, which is exactly the quantity that moves by a
   pixel. The committed baselines prove it moves — 69px against 76px at the SAME
   1440px width, between the desktop and mobile projects. Leaving one capture on
   the element crop would keep the hard-fail mode this change exists to remove,
   for no gain. */
export const NAV_BAND_HEIGHT = 120;

/* A FOURTH CI run failed differently under the element crop: #private off by
   exactly 1px of height (1340 vs 1341) at two widths. Root cause traced to
   global.css's self-hosted variable fonts (Bodoni Moda, Archivo): `goto`'s
   `networkidle` waits for the font network request to finish, not for the
   browser to finish applying it to layout, so a screenshot can land either side
   of that reflow depending on how the run happens to schedule it. Waiting on
   `document.fonts.ready` closes the gap at its source. Kept after DEF-56 — the
   fixed clip stops that race breaking the IMAGE SIZE, but the reflow still
   moves text inside the frame, which is a real diff this gate should not eat. */
export const waitForFonts = (page) => page.evaluate(() => document.fonts.ready);

export const openHomePage = async (page, width) => {
  await page.setViewportSize({ width, height: CLIP_HEIGHT });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForFonts(page);
  await page.addStyleTag({
    content: '*,*::before,*::after{animation:none!important;transition:none!important}',
  });
  await page.waitForTimeout(400);
};

/* The partner check for "the dimensions are constant by construction". They are
   constant only while the clip FITS inside the layout viewport, because
   Playwright clamps rather than throws (measured: viewport 390x900, clip
   440x900, result 390x900).

   WHAT IT ACTUALLY GUARDS, corrected by cross-model review. An earlier version
   of this comment said it catches "a classic 15px scrollbar appearing". That is
   WRONG and the reviewer was right: `window.innerWidth` INCLUDES the scrollbar,
   so a scrollbar leaves `vp.w === width` and this can never fire on it. It also
   does not need to — the screenshot is the window's width, not the layout
   width, so a scrollbar does not shrink the frame either.
   What it does guard is this file's own two numbers staying coupled: the
   viewport openHomePage() sets, and the clip its caller asks for. Get those out
   of step and every image silently shrinks with nobody noticing, which is
   DEF-56 again through a different door.

   RED WHEN: make openHomePage() set a viewport shorter or narrower than the clip
   it is about to take. Proved with `height: 800` — "layout viewport is 800px
   tall, so a 900px clip would be clamped". */
export const assertClipFits = async (page, width, height) => {
  const vp = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
  expect(vp.w, `layout viewport is ${vp.w}px wide, so a ${width}px clip would be clamped`).toBe(width);
  expect(
    vp.h,
    `layout viewport is ${vp.h}px tall, so a ${height}px clip would be clamped`,
  ).toBeGreaterThanOrEqual(height);
};

/* The net the element crop provided for free, put back explicitly. A locator
   screenshot waits for its element to be visible, so any change that HID the
   subject failed loudly before a pixel was compared. `page.screenshot` has no
   subject and will happily photograph a blank frame. Measured with
   `body { display: none }`: the old nav capture failed on "waiting for
   locator('.site-nav')" while the bare clip PASSED, because the html ground is
   still painted dark and only 4-8% of the nav band changed. One assertion
   restores it, and it is not decoration — it is the only reason the blank-page
   mutation is red on all six captures rather than on eight frames of thirty.

   RED WHEN: `body { display: none }` or `.site-nav { display: none }`. Both
   proved.

   TWO THINGS IT DOES NOT CATCH, from cross-model review, checked before being
   written down. Removing ONE plate's `id` does not reach here at all: the loop
   derives its population from `.plate[id]` AFTER the removal, so that plate
   simply leaves the list and nothing notices — only removing every id trips the
   denominator. And `toBeVisible()` counts `opacity: 0` as visible. Both are
   covered by tests/geometry.spec.js, which compares key sets in BOTH directions
   and whose own header says so: "RED WHEN: a plate is added and not baselined,
   or a plate vanishes" (lib/geometry-compare.mjs). The `plateCount` floor there
   is 4 on `/` and would NOT catch it, so the key-set comparison is the reason,
   not the count. */
export const expectVisible = async (page, selector) => {
  await expect(page.locator(selector), `${selector} is not visible, so the clip photographs nothing`).toBeVisible();
};

/* The toHaveScreenshot options for one fixed frame. x/y are 0 because the clip
   is VIEWPORT-relative, not document-relative — measured: the same clip taken
   at scrollY 0 and scrollY 3000 returns different images, both 390x900.

   `scale` is pinned, not left to default. A cross-model review found the last
   route by which "the dimensions are constant" could still be false: the
   default is `"css"` (types/test.d.ts:225, "Defaults to \"css\"") but it is a
   CONFIG option, so someone setting `expect: { toHaveScreenshot: { scale:
   "device" } }` in playwright.config.js would multiply every image by the
   device pixel ratio — 2.625 on the mobile project's Pixel 7 — and every
   baseline would mismatch on size again. Pinning it here means this file's
   promise does not depend on a setting in another file. */
export const clipOf = (width, height, maxDiffPixelRatio) => ({
  clip: { x: 0, y: 0, width, height },
  scale: 'css',
  maxDiffPixelRatio,
});
