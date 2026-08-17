// P-10: every /projects/<slug> page carries its own giscus comment thread,
// bound to its own slug — not another project's, and not the URL (which can
// rename without orphaning the thread).
//
// WHICH CHANGE TURNS EACH RED (watched; ledger: docs/STATUS.md):
//   wrong term    — data-term set to a different project's slug (the exact
//                    "wrong project, still passes" class R-7 found in P-9's
//                    own evidence-link mechanism, recurring here without a
//                    lock would repeat it)
//   loose mapping — data-mapping or data-strict changed, widening the match
//   missing mount — the .giscus div dropped for one project
//   blocking load — the loader script loses `async` (would block first
//                    paint on a page whose OWN content needs no such wait)

import { test, expect } from '@playwright/test';
import { projects } from '../src/data/projects.js';

const slugs = Object.keys(projects);

test('every project page mounts giscus bound to its OWN slug, non-blocking', async ({
  page,
}) => {
  expect(slugs.length, 'projects.js is empty — this test would assert nothing').toBeGreaterThan(0);

  for (const slug of slugs) {
    await page.goto(`/projects/${slug}`);
    const mount = page.locator('.giscus');
    await expect(mount, `${slug}: no giscus mount point`).toHaveCount(1);
    await expect(mount, `${slug}: data-term doesn't match its own slug`).toHaveAttribute(
      'data-term',
      slug,
    );
    await expect(mount).toHaveAttribute('data-mapping', 'specific');
    await expect(mount).toHaveAttribute('data-strict', '1');

    const loader = page.locator('script[src="https://giscus.app/client.js"]');
    await expect(loader, `${slug}: giscus loader script missing`).toHaveCount(1);
    // async is a boolean attribute — present with any value (including "")
    // means present; absent means the tag would block parsing.
    expect(
      await loader.evaluate((el) => el.hasAttribute('async')),
      `${slug}: loader script isn't async — would block the page's own content`,
    ).toBe(true);
  }
});
