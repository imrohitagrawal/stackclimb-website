// The hero practice panel (D107, StackClimb-Hero-Practice) — split out of
// hero-motion.spec.js when the D8 budget caught it at 269/250, same reason
// that file was itself split from motion.spec.js once already: one concern
// per file, not two sharing a budget.
//
// Six rows, each swapping a `.chip-pending`/`.chip-resolved` pair on its
// own `--row-delay`, plus header/verdict `.state-pending`/`.state-done`.
// Shipped red four times before it shipped green, none caught by reading
// the CSS: an omitted keyframe `to` fell back to a same-rule opacity:0
// override; `steps(1)`'s default jump-end needed an exact float boundary a
// `calc()` delay missed by one epsilon; `linear` (the fix for that) let
// axe catch a real transient color-contrast violation mid-fade; and a
// clip-path revision (requested via emil-design-eng, replacing the
// jump-start snap with a considered wipe) reintroduced the FIRST bug's
// shape in a new place — a static override sitting in the same rule as a
// conditionally-killed animation, this time stripping a chip that had
// already resolved back to hidden the moment reduced-motion flipped
// mid-visit. Full account in docs/STATUS.md D108/D109.

import { test, expect } from '@playwright/test';

test.describe('hero practice panel', () => {
  const ROWS = 6;
  const rowSel = (i) => `.practice-row:nth-child(${i + 1})`;
  const chipSel = (i) => `${rowSel(i)} .chip-resolved`;
  const pendingSel = (i) => `${rowSel(i)} .chip-pending`;

  // Technique-agnostic: asks the browser what is actually painted and
  // hit-testable at the element's own center, rather than reading a
  // specific CSS property. Chosen after the mechanism moved from
  // opacity to clip-path (D109) and an opacity-based check kept passing
  // vacuously — clip-path affects hit-testing too, so a clipped-away
  // resolved chip correctly falls through to whatever sits under it.
  // Never scrolls the target itself — a `display:none` element (pending,
  // correctly, once resolved) is not "actionable", and
  // scrollIntoViewIfNeeded() on it hangs retrying forever, failing for a
  // reason that has nothing to do with what the check is testing. The
  // ROW is always visible and is what actually needs scrolling: on mobile
  // the panel sits below the fold, and skipping this returned null for
  // every row (caught immediately, not a flake — failed 6/6 identically).
  const isRendered = (page, sel) =>
    page.locator(sel).evaluate((el) => {
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!top && (top === el || el.contains(top));
    });

  const readResolved = async (page) => {
    const out = [];
    for (let i = 0; i < ROWS; i++) {
      await page.locator(rowSel(i)).scrollIntoViewIfNeeded();
      const text = await page.locator(chipSel(i)).evaluate((el) => el.textContent.trim());
      const resolvedVisible = await isRendered(page, chipSel(i));
      const pendingVisible = await isRendered(page, pendingSel(i));
      out.push({ text, resolvedVisible, pendingVisible });
    }
    return out;
  };

  test('all six rows resolve under hero-anim — not stuck on "checking"', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveClass(/hero-anim/);
    await page.waitForTimeout(2400); // full sequence ends at 2.13s + 180ms
    const rows = await readResolved(page);
    rows.forEach((r, i) => {
      expect(r.resolvedVisible, `row ${i} resolved chip should end visible`).toBe(true);
      expect(r.pendingVisible, `row ${i} pending chip should end hidden`).toBe(false);
    });
    expect(rows[5].text, 'last row is the block verdict').toBe('Blocking');
    expect(rows[0].text, 'a pass row is the enforced verdict').toBe('Enforced');
    const stateDone = await page
      .locator('.practice-head .state-done')
      .evaluate((el) => parseFloat(getComputedStyle(el).opacity));
    expect(stateDone, 'header should swap to its done text').toBeGreaterThan(0.9);
  });

  test('prefers-reduced-motion: every row already resolved, no "checking"', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/', { waitUntil: 'networkidle' });
    const rows = await readResolved(page);
    rows.forEach((r, i) => {
      expect(r.resolvedVisible, `row ${i} under reduced motion`).toBe(true);
      expect(r.pendingVisible, `row ${i} pending under reduced motion`).toBe(false);
    });
    await ctx.close();
  });

  test('reduced motion flipped AFTER load still resolves (the CSS block)', async ({ page }) => {
    // Shipped red twice here (D109): checking only that the animation NAME
    // went to 'none' passed even while a static override left in the SAME
    // rule as the (now-killed) animation snapped a resolved chip straight
    // back to fully clipped — the animation stopping said nothing about
    // what the chip was left showing. Flips AFTER the sequence has already
    // resolved, not before, since that is exactly when the bug bit: a
    // chip that was already correctly visible got re-hidden by the flip.
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveClass(/hero-anim/);
    await page.waitForTimeout(2400);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const name = await page.locator(chipSel(0)).evaluate((el) => getComputedStyle(el).animationName);
    expect(name, 'row 0 after a mid-visit reduce flip').toBe('none');
    const rows = await readResolved(page);
    rows.forEach((r, i) => {
      expect(r.resolvedVisible, `row ${i} should stay visible after the flip`).toBe(true);
      expect(r.pendingVisible, `row ${i} pending should stay hidden after the flip`).toBe(false);
    });
  });

  test('persisted toggle-off: every row already resolved', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('motion', 'off'));
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).not.toHaveClass(/hero-anim/);
    const rows = await readResolved(page);
    rows.forEach((r, i) => expect(r.resolvedVisible, `row ${i} with motion off`).toBe(true));
  });

  test('JavaScript disabled: every row already resolved (DEF-1)', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/');
    const rows = await readResolved(page);
    rows.forEach((r, i) => expect(r.resolvedVisible, `row ${i} with JS off`).toBe(true));
    await ctx.close();
  });

  test('Replay button restarts the sequence from pending', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2400);
    await page.click('.practice-replay');
    // Row 5, not row 0: row 0 resolves in 480ms, and the scroll+evaluate
    // round trip alone can eat that window (measured: it did, once — not a
    // flake, a real margin problem in the check, not the product). Row 5
    // has a 2.3s window, comfortably wider than any round-trip cost.
    await page.locator(rowSel(5)).scrollIntoViewIfNeeded();
    const justAfter = await isRendered(page, pendingSel(5));
    expect(justAfter, 'row 5 pending right after Replay is clicked').toBe(true);
    await page.waitForTimeout(2400);
    const rows = await readResolved(page);
    rows.forEach((r, i) => expect(r.resolvedVisible, `row ${i} after replay completes`).toBe(true));
  });

  test('state swap jumps, never fades (the axe color-contrast finding, D108)', async ({ page }) => {
    // linear briefly rendered partial-opacity text; axe caught it for real.
    // Chips moved to clip-path since (D109), which has no such window by
    // construction — this guard now belongs to state-pending/state-done,
    // the one pair still hiding via opacity + a discrete jump.
    await page.goto('/', { waitUntil: 'networkidle' });
    const tf = await page
      .locator('.practice-head .state-done')
      .evaluate((el) => getComputedStyle(el).animationTimingFunction);
    // Computed style normalizes jump-start to the older start/end
    // vocabulary (steps(1, start)) — checked directly, not assumed.
    expect(tf).toContain('start');
  });


  // ---------------------------------------------------------------------------
  // DEF-55. The verdict's two sentences are siblings in one <p>. Under
  // html.hero-anim, hero-practice.css gives .state-pending `display: inline`
  // and animates `practice-hide`, which changes OPACITY ONLY -- with
  // fill-mode `both` the invisible sentence keeps its line boxes forever and
  // shoves the visible one sideways and down. Measured in production before
  // the fix: at 1440 the pending span held rects [815,724,393] and
  // [815,744,36], so the real sentence began at x=851 on line TWO instead of
  // x=815 on line one; at 390 it stranded "The last" at x=258.
  //
  // The reduced-motion and motion-off paths were never affected -- both set
  // .state-pending to `display: none`, which reserves nothing. Only the
  // default animated path is wrong, which is why this test runs there.
  // ---------------------------------------------------------------------------

  test('the resolved verdict starts at the top-left of its block, not indented by the hidden sentence', async ({
    page,
  }) => {
    // RED WHEN: .practice-verdict stops stacking its two spans in one grid
    // cell -- delete the `display: grid` rule or the `grid-area: 1 / 1` on its
    // spans and the hidden sentence reclaims its line boxes, pushing the
    // visible one right and down. Both were measured going red before this
    // shipped.
    await page.goto('/', { waitUntil: 'networkidle' });

    const verdict = page.locator('.practice-verdict');
    await expect(verdict, 'no .practice-verdict on the page').toHaveCount(1);
    await verdict.scrollIntoViewIfNeeded();

    // The swap lands at 2.13s; wait past it so this measures the RESOLVED state.
    await page.waitForTimeout(3000);

    const m = await verdict.evaluate((v) => {
      const box = v.getBoundingClientRect();
      const done = v.querySelector('.state-done');
      const pending = v.querySelector('.state-pending');
      const first = done.getClientRects()[0];
      return {
        boxX: box.x,
        boxY: box.y,
        doneX: first ? first.x : null,
        doneY: first ? first.y : null,
        doneText: done.textContent.trim(),
        pendingPresent: !!pending,
        pendingDisplay: pending ? getComputedStyle(pending).display : null,
      };
    });

    // DENOMINATORS: both must hold, or the assertions below would pass on an
    // empty or single-child element that never had the defect.
    expect(m.doneText.length, 'the verdict rendered no resolved text').toBeGreaterThan(0);
    expect(m.pendingPresent, 'no .state-pending sibling — nothing could displace anything').toBe(true);

    // Only meaningful while the pending sentence still occupies the flow.
    // Where it is display:none (reduced motion, motion off) there is nothing
    // to overlay and the check is trivially satisfied.
    if (m.pendingDisplay !== 'none') {
      expect(Math.abs(m.doneX - m.boxX), `verdict starts indented: doneX=${m.doneX} boxX=${m.boxX}`)
        .toBeLessThanOrEqual(1);
      expect(Math.abs(m.doneY - m.boxY), `verdict starts on a later line: doneY=${m.doneY} boxY=${m.boxY}`)
        .toBeLessThanOrEqual(2);
    }
  });

  test('the hidden verdict sentence is not exposed to assistive technology', async ({ page }) => {
    // RED WHEN: aria-hidden is removed from .state-pending. Both sentences are
    // in the DOM at once and opacity:0 does NOT remove an element from the
    // accessibility tree, so without this a screen reader reads two sentences
    // that contradict each other.
    await page.goto('/', { waitUntil: 'networkidle' });

    const pending = page.locator('.practice-verdict .state-pending');
    await expect(pending, 'no pending verdict sentence to check').toHaveCount(1);
    await expect(pending, 'the hidden verdict sentence is still in the a11y tree')
      .toHaveAttribute('aria-hidden', 'true');
  });

});
