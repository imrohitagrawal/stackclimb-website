// P-10: every /projects/<slug> page carries its own giscus comment thread,
// bound to its own slug — not another project's, and not the URL (which can
// rename without orphaning the thread).
//
// R-7 (Codex, read-only) found the first draft's config lived entirely on
// an inert `.giscus` div while the loader script carried none of it. giscus
// reads its config from `document.currentScript.dataset` — the SCRIPT
// tag's own attributes — so the real widget would have received
// `repo=undefined` and silently fallen back to pathname mapping. The first
// draft's test passed anyway because it checked the div, never the script
// that giscus actually reads. Fixed at the source (config moved onto the
// script) and here (this file asserts the script's attributes, not the
// div's).
//
// WHICH CHANGE TURNS EACH RED (watched; ledger: docs/STATUS.md):
//   wrong term    — the SCRIPT's data-term set to a different project's
//                    slug (the "wrong project, still passes" class R-7
//                    found in P-9's evidence-link mechanism, recurring)
//   loose mapping — data-mapping or data-strict on the script changed
//   config on div — config moved back onto the div instead of the script
//                    (the exact R-7 finding, guarded so it can't recur)
//   missing mount — the .giscus div dropped for one project
//   blocking load — the loader script loses `async`
//   eager load    — the loader script loses `data-loading="lazy"`

import { test, expect } from '@playwright/test';
import { projects } from '../src/data/projects.js';

const slugs = Object.keys(projects);

test('every project page mounts giscus, configured on the SCRIPT it reads from', async ({
  page,
}) => {
  expect(slugs.length, 'projects.js is empty — this test would assert nothing').toBeGreaterThan(0);

  for (const slug of slugs) {
    await page.goto(`/projects/${slug}`);

    // The mount point: present, but deliberately inert — giscus injects its
    // iframe here, it does not read config from it.
    const mount = page.locator('.giscus');
    await expect(mount, `${slug}: no giscus mount point`).toHaveCount(1);
    for (const attr of ['data-repo', 'data-repo-id', 'data-category', 'data-term']) {
      expect(
        await mount.getAttribute(attr),
        `${slug}: config landed on the div, not the script — the exact R-7 regression`,
      ).toBeNull();
    }

    // The script: this is what giscus's client actually reads
    // (document.currentScript.dataset) — every real config value lives here.
    const loader = page.locator('script[src="https://giscus.app/client.js"]');
    await expect(loader, `${slug}: giscus loader script missing`).toHaveCount(1);
    await expect(loader, `${slug}: wrong repo`).toHaveAttribute(
      'data-repo',
      'imrohitagrawal/stackclimb-website',
    );
    await expect(loader, `${slug}: data-term doesn't match its own slug`).toHaveAttribute(
      'data-term',
      slug,
    );
    await expect(loader).toHaveAttribute('data-mapping', 'specific');
    await expect(loader).toHaveAttribute('data-strict', '1');
    await expect(loader, `${slug}: not lazy — a below-fold iframe would load eagerly`).toHaveAttribute(
      'data-loading',
      'lazy',
    );
    // Boolean attributes: present with ANY value (including "") means
    // present — the P-9 R-7 lesson about `open="false"` applied here too.
    expect(
      await loader.evaluate((el) => el.hasAttribute('async')),
      `${slug}: loader script isn't async — would block the page's own content`,
    ).toBe(true);
  }
});
