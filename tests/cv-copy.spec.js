import { test, expect } from '@playwright/test';

/* P-22, the copy half. /cv puts the CV on the clipboard as clean plain text.
 *
 * WHY THIS EXISTS. The owner reported the control missing; it had never been
 * there. The site's only copy control was the contact plate's copy-EMAIL
 * button, wired through `getElementById('contact')` — a container /cv does not
 * have (D143). What a recruiter needs on the CV page is not the address, it is
 * the CV in the form an applicant-tracking system will accept, because her next
 * move is a paste into a form field.
 *
 * RED WHEN: delete the `.cv-foot .btn` removal in copy-cv.js and the paste
 * carries "Email me / The systems"; delete `.btn[hidden]` from
 * copy-control.css and the button paints with JavaScript off; break the
 * href-appending loop and the two profile URLs vanish from the paste.
 */

const CHROME = ['Email me', 'The systems', 'Copy as text', 'Printing it produces', 'Skip to content'];

test.describe('/cv: copy as text', () => {
  test('the control is dead-surface-free — it never paints without JavaScript', async ({ browser }) => {
    /* DEF-1 and DEF-2 are both on this site's record because a control that
       could not work was shipped visible. `.btn` sets display:inline-block and
       an author rule beats the UA stylesheet's `[hidden]`, so this is a real
       failure mode, not a hypothetical: measured at 168x45px before
       copy-control.css existed. */
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/cv', { waitUntil: 'networkidle' });
    const button = page.locator('[data-copy-cv]');
    await expect(button, 'the control must exist in the markup').toHaveCount(1);
    expect(await button.evaluate((el) => getComputedStyle(el).display),
      'the copy control PAINTS with JavaScript off — a control that cannot work must never show')
      .toBe('none');
    await ctx.close();
  });

  test('it copies the CV, with the profile URLs and without the page chrome', async ({ browser }) => {
    const ctx = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage();
    await page.goto('/cv', { waitUntil: 'networkidle' });

    const button = page.locator('[data-copy-cv]');
    await expect(button, 'the control never became visible — the script did not run').toBeVisible();
    await button.click();
    await expect(page.locator('[data-copy-label]'), 'the button did not report a copy').toHaveText('Copied');

    const text = await page.evaluate(() => navigator.clipboard.readText());

    /* DENOMINATOR FIRST. Every "does not contain" below is satisfied by an
       empty clipboard, which certifies sameness rather than correctness — the
       ["",""] shape this repo has been bitten by. Prove a real CV landed. */
    expect(text.length, 'almost nothing was copied — the exclusions below prove nothing')
      .toBeGreaterThan(3000);
    for (const anchor of ['Rohit Agrawal', 'Oracle', 'Bengaluru']) {
      expect(text, `"${anchor}" missing — this is not the CV`).toContain(anchor);
    }

    /* The href-appending half. innerText gives "LinkedIn", not the URL, so a
       pasted CV would silently lose both profiles. */
    expect(text, 'the LinkedIn URL is missing from the paste').toContain('linkedin.com/in/');
    expect(text, 'the GitHub URL is missing from the paste').toContain('github.com/');

    /* RCA-011. innerText reports only what actually renders, and a closed <details>'s body does
       not — same UA mechanism as the PDF case in pdf-text.spec.js. Without opening the clone's
       <details> elements first, Independent Systems pastes as six bare name/status rows. Four
       anchors, not one, so a fix that only opens some cards (e.g. the first <details>) cannot
       pass as complete — same reasoning as pdf-text.spec.js's four-anchor check.
       RED WHEN: the `d.open = true` loop in copy-cv.js is removed. */
    for (const anchor of [
      'Delhi-NCR',
      'citevyn.stackclimb.com',
      'Grounded walkthrough generation',
      'faithfulness, answer relevancy',
    ]) {
      expect(text, `"${anchor}" missing from the paste — Independent Systems' content did not copy`).toContain(anchor);
    }

    /* And the exclusions, which are the reason this is not just select-all. */
    const leaked = CHROME.filter((c) => text.includes(c));
    expect(leaked, `page chrome leaked into the paste:\n${leaked.join('\n')}`).toEqual([]);
    await ctx.close();
  });
});
