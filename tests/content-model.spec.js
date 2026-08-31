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
 *   4. the record note renders p.eng (part 5 — previously NO gate covered it:
 *      deleting note={p.eng} built green, the round-1 fan's BLOCK finding)
 *   5. limits stay on the record plate — the content model's "never above
 *      the fold" clause. It read "line 63" until DEF-71 (RCA-018): that is
 *      line 63 of the model's SOURCE document, which is not in this repo,
 *      so no reader here could ever resolve it. docs/plan/package-c.md
 *      quotes the clause in full and names the source; cite that instead
 *
 * Hardened after the R-7 Codex pass found nine holes in the first version —
 * the same lesson as contact.spec.js: assert PAINTED and EXACT, not declared.
 * Painted = computed opacity > 0.5 and a real box; exact = class-token match,
 * note equality with p.eng, sha with a token boundary, an anchored header
 * regex, and every gaps line checked, entities decoded both ways.
 *
 * WHICH CHANGE TURNS EACH RED (proved by mutation before shipping):
 *  - reorder or separate <p class="q"> from the h1 (e.g. an <aside> between) → 1
 *  - rename the class to "not-q" (token match, not substring)                → 1
 *  - .q { opacity: 0 }                                                       → 1
 *  - revert a competency paragraph in project-pages.js                       → 2
 *  - replace a TERM with a near-miss ("Devanagri")                           → 2
 *  - hide the term in an opacity-0 span — standalone OR nested in a painted
 *    paragraph — or park it in .q / .sys-gate instead of a body paragraph    → 2
 *  - keep a stale strip stamp while the evidence header moves                → 3
 *  - move the evidence header sha while the strip stays                      → 3
 *  - pad the stamp to @<sha>0 (token boundary)                               → 3
 *  - a decoy unbolded "Re-measured" line cannot hijack the header parse      → 3
 *  - .caps { display: none }                                                 → 3
 *  - remove note={p.eng} or swap in another system's note                    → 4
 *  - .proj-note { opacity: 0 }                                               → 4
 *  - render ANY record.gaps line inside plate 1 (also entity-encoded)        → 5
 *  - rename Record.astro's .record class (the absence check has a partner)   → 5
 */

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

/* Anchored to the file's bold header line — a decoy "Re-measured …" sentence
 * in body prose has no line-start bold marker and cannot match (Codex hole 9). */
const headerSha = (file) => {
  const m = readFileSync(file, 'utf8').match(/^\*\*Re-measured [^`\n]*`([0-9a-f]{7,40})`/m);
  if (!m) throw new Error(`${file}: no authoritative "**Re-measured … \`sha\`" header line`);
  return m[1].slice(0, 7);
};

/* Decodes numeric entities too — innerText decodes them in the browser, so a
 * data string written as "&#84;wo stations…" must still match (Codex hole 7). */
const strip = (html) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&rsquo;/g, '’')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

/* PAINTED, not declared: Playwright's toBeVisible passes at opacity 0, and
 * innerText of a display:none subtree falls back to textContent (Codex holes
 * 3, 6, 8). Own computed opacity + a real box close both. */
const painted = async (locator) => {
  await expect(locator).toBeVisible();
  const ok = await locator.evaluate((el) => {
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    return Number(cs.opacity) > 0.5 && cs.visibility !== 'hidden' && box.height > 4 && box.width > 4;
  });
  expect(ok, 'element is in the DOM but not painted').toBe(true);
};

const norm = (t) => t.replace(/\s+/g, ' ').trim();

for (const slug of Object.keys(projects)) {
  test.describe(`/projects/${slug} content model`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/projects/${slug}`);
    });

    test('the question is the first thing after the title', async ({ page }) => {
      /* h1 + p: the element DIRECTLY after the title, not merely the first
         <p> descendant — an <aside> wedged between goes red (Codex hole 2). */
      const q = page.locator(`#${slug} .plate-copy h1 + p`);
      await painted(q);
      /* classList token, not a \b regex — class="not-q" goes red (hole 4). */
      expect(await q.evaluate((el) => el.classList.contains('q'))).toBe(true);
      await expect(q).toHaveText(projects[slug].q);
    });

    test('plate 1 carries the competency term in a painted paragraph', async ({ page }) => {
      /* The term must sit in a rendered, painted BODY paragraph — not .q or
         .sys-gate (built-fan: any painted <p> satisfied the first version),
         and the paint check runs on the INNERMOST element holding the term,
         so an opacity-0 span nested in a painted paragraph goes red too
         (Codex hole 5 + the built-fan's nested-span neighbour). */
      const sel = `#${slug} .plate-copy p:not(.q):not(.sys-gate)`;
      const hit = await page.locator(sel).evaluateAll((els, term) => {
        const paintedEl = (el) => {
          const cs = getComputedStyle(el);
          const box = el.getBoundingClientRect();
          return Number(cs.opacity) > 0.5 && cs.visibility !== 'hidden' && box.height > 4;
        };
        return els.some((el) => {
          if (!el.textContent.includes(term) || !paintedEl(el)) return false;
          /* Innermost element that still contains the term carries its paint. */
          let holder = el;
          for (;;) {
            const child = [...holder.children].find((c) => c.textContent.includes(term));
            if (!child) break;
            holder = child;
          }
          return paintedEl(holder);
        });
      }, TERM[slug]);
      expect(hit, `${slug} plate 1 lost its painted competency paragraph`).toBe(true);
    });

    test('the record note renders this system’s engineering note', async ({ page }) => {
      const note = page.locator(`#${slug}-record .proj-note`);
      await painted(note);
      /* Equality with p.eng, not mere non-emptiness — every page rendering
         CiteVyn's note goes red (Codex hole 6). */
      const text = norm(await note.innerText());
      expect(text, `${slug} record note is not its own p.eng`).toBe(strip(projects[slug].eng));
    });

    test('limits stay on the record plate', async ({ page }) => {
      await expect(page.locator(`#${slug} .record`)).toHaveCount(0);
      /* Partner for the absence check: `.record` is still the class the
         component renders — renaming it must fail here, not go vacuous
         (built-fan finding; the owner's standing counts-nothing rule). */
      await expect(page.locator(`#${slug}-record .record`)).toHaveCount(1);
      const copy = norm(await page.locator(`#${slug}`).innerText());
      /* EVERY gaps line, not only the first (Codex hole 1). */
      for (const gap of pages[slug].record.gaps) {
        const prefix = strip(gap).slice(0, 60);
        expect(copy, `${slug} plate 1 leaks a Known-gaps line`).not.toContain(prefix);
      }
    });
  });
}

for (const [slug, evidence] of Object.entries(STAMPED)) {
  test(`${slug} strip stamp matches the evidence header sha`, async ({ page }) => {
    const sha = headerSha(evidence);
    await page.goto(`/projects/${slug}`);
    const caps = page.locator(`#${slug} .caps`);
    /* Painted: display:none innerText would still carry the text (hole 8). */
    await painted(caps);
    /* Token boundary: "@<sha>0" must not satisfy "@<sha>" (hole 9). The strip
       renders text-transform: uppercase, so compare lowercased. */
    const text = (await caps.innerText()).toLowerCase();
    expect(text, `${slug} strip stamp disagrees with ${evidence}`).toMatch(
      new RegExp(`@${sha}(?![0-9a-f])`),
    );
  });
}
