import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { projects } from '../src/data/projects.js';
import { pages } from '../src/data/project-pages.js';

/* Package C — the 8-part content model, gated where it is mechanical.
 *
 * Five assertions, mapped in docs/plan/package-c.md's clause table:
 *   1. the question opens plate 1 (model part 1, "positives lead")
 *   2. plate 1 carries the per-slug competency TERM (part 2) — the semantic
 *      "names a verified technique" property lives in docs/evidence/, not here
 *   3. the strip stamp equals the evidence file's authoritative sha (part 4)
 *   4. the record note renders (part 5 — previously NO gate covered p.eng:
 *      deleting note={p.eng} built green, the round-1 fan's BLOCK finding)
 *   5. limits stay on the record plate (line 63: "never above the fold")
 *
 * WHICH CHANGE TURNS EACH RED (proved by mutation before shipping):
 *  - reorder <p class="q"> below the body paragraphs in [slug].astro  → 1
 *  - revert a competency paragraph in project-pages.js               → 2
 *  - replace a TERM with a near-miss ("Devanagri")                   → 2
 *  - keep a stale strip stamp while the evidence header moves        → 3
 *  - move the evidence header sha while the strip stays              → 3
 *  - remove note={p.eng} from [slug].astro                           → 4
 *  - render a record.gaps line inside plate 1                        → 5
 *
 * The sha test parses the FIRST `Re-measured … `sha`` line of the evidence
 * file — the authoritative header — so the kept, superseded 08-11 sections
 * (which still carry their old shas) can never satisfy it. */

/* The load-bearing technique word per system. A term lives in exactly one
 * plate-1 paragraph, so reverting that paragraph is what turns this red —
 * the count-only "a deferred paragraph renders" gate in project-plate1.spec.js
 * stays green through that mutation (round-1 fan, HIGH). */
const TERM = {
  citevyn: 'skeptic',
  quorum: 'HMAC',
  saafsaans: 'Devanagari',
  narratwin: 'checksum',
};

/* Strips whose figures are re-derived from a sibling repo carry the sha they
 * were measured at. CiteVyn and Quorum's strips carry no sibling-repo counts
 * re-derived this package — recorded in the plan, not silently skipped. */
const STAMPED = {
  saafsaans: 'docs/evidence/projects/saafsaans.md',
  narratwin: 'docs/evidence/projects/narratwin.md',
};

const headerSha = (file) => {
  const m = readFileSync(file, 'utf8').match(/Re-measured[^`]*`([0-9a-f]{7,40})`/);
  if (!m) throw new Error(`${file}: no authoritative "Re-measured … \`sha\`" header`);
  return m[1].slice(0, 7);
};

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
  test.describe(`/projects/${slug} content model`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/projects/${slug}`);
    });

    test('the question is the first thing after the title', async ({ page }) => {
      const q = page.locator(`#${slug} .plate-copy p`).first();
      await expect(q).toBeVisible();
      await expect(q).toHaveClass(/\bq\b/);
      await expect(q).toHaveText(projects[slug].q);
    });

    test('plate 1 carries the competency term', async ({ page }) => {
      const copy = await page.locator(`#${slug} .plate-copy`).innerText();
      expect(copy, `${slug} plate 1 lost its competency paragraph`).toContain(TERM[slug]);
    });

    test('the record note renders', async ({ page }) => {
      const note = page.locator(`#${slug}-record .proj-note`);
      await expect(note).toBeVisible();
      const text = await note.innerText();
      expect(text.trim().length, `${slug} record note is empty`).toBeGreaterThan(40);
    });

    test('limits stay on the record plate', async ({ page }) => {
      await expect(page.locator(`#${slug} .record`)).toHaveCount(0);
      const copy = await page.locator(`#${slug}`).innerText();
      const firstGap = strip(pages[slug].record.gaps[0]).slice(0, 60);
      expect(copy, `${slug} plate 1 leaks a Known-gaps line`).not.toContain(firstGap);
    });
  });
}

for (const [slug, evidence] of Object.entries(STAMPED)) {
  test(`${slug} strip stamp matches the evidence header sha`, async ({ page }) => {
    const sha = headerSha(evidence);
    await page.goto(`/projects/${slug}`);
    /* The strip renders text-transform: uppercase, so compare lowercased. */
    const caps = (await page.locator(`#${slug} .caps`).innerText()).toLowerCase();
    expect(caps, `${slug} strip stamp disagrees with ${evidence}`).toContain(`@${sha}`);
    /* Partner assertion (a check that counts nothing needs one proving the
       counted thing exists): the stamp really is sha-shaped, not absent. */
    expect(caps).toMatch(/@[0-9a-f]{7}/);
  });
}
