/* renderedText() — the visible text of one built route, normalised.
 *
 * WHY IT EXISTS. It is the whole autonomy boundary for D163's self-merging
 * runs (docs/practices/autonomous-run.md). A package may merge itself only if
 * the rendered text of every route is byte-identical before and after, which
 * turns P-18 — "decisions altering facts, self-descriptions or claims are the
 * owner's" — from a judgement into a diff. Gate hardening changes no rendered
 * copy and passes by construction; a reworded claim cannot pass, ever.
 *
 * WHY IT READS THE DOM, NOT THE HTML. tests/og-card-contract.spec.js first
 * flattened built HTML with a regex and a hand-written entity table. That was
 * wrong twice over: stripping a tag leaves a space where textContent leaves
 * none (so `Quorum<span>-</span>AI` stopped matching `Quorum-AI`), and the
 * entity list could never be complete. The DOM already knows what the text is.
 *
 * WHAT IS DELIBERATELY EXCLUDED. <script>, <style>, and <template> are not
 * read by a visitor. Everything else is in, INCLUDING text the page currently
 * hides — because a change from hidden to shown is exactly the kind of drift
 * this must catch. og.png shipped reading CHECKING on 2026-08-30 because a
 * generator revealed an element the page hides; a visibility filter here would
 * have called that "no change".
 */

/** Normalised visible text of the page currently loaded in `page`. */
export async function renderedText(page) {
  return page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const tag = node.parentElement?.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEMPLATE') {
          return NodeFilter.FILTER_REJECT;
        }
        return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const out = [];
    let n;
    while ((n = walker.nextNode())) out.push(n.textContent.replace(/\s+/g, ' ').trim());
    return out.join('\n');
  });
}

/** { route: text } for every route given, from a served build. */
export async function renderedTextByRoute(page, routes) {
  const map = {};
  for (const route of routes) {
    await page.goto(route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    map[route] = await renderedText(page);
  }
  return map;
}

/** Routes whose text differs, with a first differing line for each. */
export function diffRoutes(before, after) {
  const routes = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
  const changed = [];
  for (const route of routes) {
    const a = before[route] ?? '<route absent>';
    const b = after[route] ?? '<route absent>';
    if (a === b) continue;
    const al = a.split('\n');
    const bl = b.split('\n');
    const i = al.findIndex((line, k) => line !== bl[k]);
    changed.push({
      route,
      firstDiffLine: i === -1 ? al.length : i,
      before: i === -1 ? `<${al.length} lines>` : (al[i] ?? '<absent>'),
      after: i === -1 ? `<${bl.length} lines>` : (bl[i] ?? '<absent>'),
    });
  }
  return changed;
}
