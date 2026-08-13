import { test, expect } from '@playwright/test';
import { projects } from '../src/data/projects.js';
import { pages } from '../src/data/project-pages.js';

/* Package B3. Plate 1 of a project page used to be a near-copy of the home
 * plate — it repeated body[0] and the proof line verbatim while LOSING the
 * Gate line and the Not claimed row (D77's recorded residual).
 *
 * SCOPE OF THE DUPLICATION GATE, decided in the plan and not to be widened:
 * it compares BODY PARAGRAPHS AND THE PROOF LINE ONLY. The question, title,
 * Gate line, Not claimed row and caption strip are deliberate cross-surface
 * anchors — B3 itself moved two of them here. An unscoped version of this test
 * goes red against the feature it gates.
 *
 * WHICH CHANGE TURNS EACH RED (proved by mutation before shipping):
 *  - render page.body (not body.slice(1)) in [slug].astro → duplication test
 *  - restore <p class="proof"> to plate 1               → duplication test
 *  - remove the sys-gate or sys-nc from plate 1          → the elements test
 *  - point the locators at the page instead of #<slug>   → the elements test
 *    passes with no change at all (the record plate renders "Not claimed"
 *    too), which is why every locator here is scoped to the FIRST plate. */

const strip = (html) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&rsquo;/g, '’')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

for (const slug of Object.keys(projects)) {
  test.describe(`/projects/${slug} plate 1`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/projects/${slug}`);
    });

    test('carries the Gate line and the Not claimed row', async ({ page }) => {
      await expect(page.locator(`#${slug} .sys-gate`)).toBeVisible();
      await expect(page.locator(`#${slug} .sys-nc`)).toBeVisible();
      await expect(page.locator(`#${slug} .sys-nc dd`)).toHaveText(projects[slug].notClaimed);
    });

    test('repeats neither the home body paragraph nor the proof line', async ({ page }) => {
      const texts = await page
        .locator(`#${slug} .plate-copy p`)
        .evaluateAll((ps) => ps.map((p) => p.textContent.replace(/\s+/g, ' ').trim()));
      const banned = [strip(pages[slug].body[0]), strip(projects[slug].proof)];
      for (const b of banned) {
        for (const t of texts) {
          expect(t, `home-plate prose repeated on plate 1 of ${slug}`).not.toBe(b);
        }
      }
      /* Partner assertion: the plate is not merely emptied — every system now
         has at least one deferred body paragraph, and it renders here. */
      expect(pages[slug].body.length, `${slug} has no deferred body paragraph`).toBeGreaterThan(1);
      const bodyTexts = texts.filter((t) => pages[slug].body.slice(1).map(strip).includes(t));
      expect(bodyTexts.length, `no deferred paragraph rendered on ${slug}`).toBeGreaterThan(0);
    });
  });
}
