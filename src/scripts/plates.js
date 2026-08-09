// One behaviour: ?at=<plate-id> jumps to a plate without the smooth-scroll ride.
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

const at = new URLSearchParams(location.search).get('at');
if (at) {
  html.classList.add('no-anim');
  const target = document.getElementById(at);
  if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
  // restore motion once the jumped-to state has painted; a timer (not rAF)
  // so it also fires in throttled or background tabs
  setTimeout(() => html.classList.remove('no-anim'), 400);
}
