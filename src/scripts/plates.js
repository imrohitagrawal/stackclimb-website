// Two entry points, one behaviour: jump to a plate without the smooth-scroll
// ride. `#<plate-id>` is the JS-free path — a real fragment link, resolved by
// the browser before any script runs (DEF-2). `?at=<plate-id>` stays for
// JS-enabled visitors who land on it already; both get the same instant jump
// instead of the ~3s smooth-scroll (DEF-21) because global.css sets
// scroll-behavior: smooth on the root.
//
// REMOVED 2026-08-09 (polish pass) — the leader-line machinery: overlayFor,
// clearLeads, drawLead, and the .cap[data-target] listener loop, ~80 lines.
// Measured before deleting: `data-target` and `data-anchor` appear on ZERO
// elements in the built HTML — the artefact panels replaced the drawn figures
// (D49), and no caption cell has carried a target since. Every listener the
// loop attached was attached to nothing. This is the second dead block this
// file has shed the same way (the data-hue IntersectionObserver went on
// 08-09 morning): a comment describing behaviour that cannot occur is the
// fault this site argues against. The CSS half (.leads, [data-anchor].lit)
// left global.css in the same change.
//
// If a future figure wants wired captions back, the deleted implementation is
// in git history at this file, pre-2026-08-09-polish.

const html = document.documentElement;

// ?at= wins if both are present (arriving with a query AND a fragment is not
// a real case); the browser has already scrolled to the #id target on its
// own by the time this script runs, so the id needs re-jumping too — not
// just no-anim — to replace that scroll with the instant one.
const id = new URLSearchParams(location.search).get('at') || location.hash.slice(1);
if (id) {
  html.classList.add('no-anim');
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
  // restore motion once the jumped-to state has painted; a timer (not rAF)
  // so it also fires in throttled or background tabs
  setTimeout(() => html.classList.remove('no-anim'), 400);
}
