// Portrait-plate behaviours:
// 1. Captions draw a leader line to the garment they name (hover/focus).
// 2. ?at=<plate-id> jumps to a plate without the smooth-scroll ride.
//
// REMOVED 2026-08-09 — "the backdrop repaints as each plate takes the easel".
// It said that for months and it had not been true since 08-08. The observer
// read `entry.target.dataset.hue`, and Plate.astro emits `data-plate-theme`
// only — `data-hue` appears on ZERO elements in the built HTML, so `--bg` was
// never once set and the 0.8s cross-fade never ran. Its other effect, mirroring
// the plate theme onto <html>, had exactly one CSS consumer, and RCA-003
// deleted that: the nav no longer reacts to what is behind it, because it now
// has a ground of its own.
//
// So the block was a no-op wearing the description of a feature. On a site
// whose subject is systems that disclose their own limits, a comment claiming
// a behaviour that does not happen is the fault it argues against.
// Verified before deleting: `grep -c data-hue dist/index.html` -> 0,
// `grep -o "\[data-theme[^]]*\]" dist/_astro/*.css` -> no matches after the
// nav fix. Phase 2 adds real scroll-linked motion; it will bring its own
// observer with a purpose, not inherit this one.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;
const html = document.documentElement;
const SVG_NS = 'http://www.w3.org/2000/svg';

/* ---------- leader lines ---------- */

function overlayFor(frame) {
  let svg = frame.querySelector(':scope > .leads');
  if (!svg) {
    svg = document.createElementNS(SVG_NS, 'svg');
    svg.classList.add('leads');
    svg.setAttribute('aria-hidden', 'true');
    frame.appendChild(svg);
  }
  return svg;
}

function clearLeads(frame) {
  const svg = frame.querySelector(':scope > .leads');
  if (svg) svg.replaceChildren();
  frame.querySelectorAll('[data-anchor].lit').forEach((el) => el.classList.remove('lit'));
}

function drawLead(cap) {
  const frame = cap.closest('.plate-frame');
  if (!frame) return;
  const anchor = frame.querySelector(`[data-anchor="${cap.dataset.target}"]`);
  if (!anchor) return;

  clearLeads(frame);
  anchor.classList.add('lit');

  const svg = overlayFor(frame);
  const frameBox = frame.getBoundingClientRect();
  const capBox = cap.getBoundingClientRect();
  const anchorBox = anchor.getBoundingClientRect();

  const startX = capBox.left + capBox.width / 2 - frameBox.left;
  const startY = capBox.top - frameBox.top;
  const endX = anchorBox.left + anchorBox.width / 2 - frameBox.left;
  const endY = anchorBox.top + anchorBox.height - frameBox.top + 4;

  const stub = Math.min(18, Math.max(10, startY - endY - 6));

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute(
    'd',
    `M ${startX} ${startY - 2} L ${startX} ${startY - 2 - stub} L ${endX} ${endY}`
  );

  const dot = document.createElementNS(SVG_NS, 'circle');
  dot.setAttribute('cx', endX);
  dot.setAttribute('cy', endY);
  dot.setAttribute('r', 3);

  if (!reduceMotion) {
    const length = path.getTotalLength
      ? Math.hypot(startX - endX, startY - endY) + stub
      : 0;
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    path.style.transition = 'stroke-dashoffset 0.24s ease-out';
    requestAnimationFrame(() => {
      path.style.strokeDashoffset = '0';
    });
  }

  svg.append(path, dot);
}

/* ---------- instant deep link: ?at=<plate-id> jumps without animation ---------- */

const at = new URLSearchParams(location.search).get('at');
if (at) {
  html.classList.add('no-anim');
  const target = document.getElementById(at);
  if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
  // The --bg and data-theme lines that were here went with the observer above:
  // same dead `data-hue` read, same now-unread theme mirror.
  // restore motion once the jumped-to state has painted; a timer (not rAF)
  // so it also fires in throttled or background tabs
  setTimeout(() => html.classList.remove('no-anim'), 400);
}

document.querySelectorAll('.cap[data-target]').forEach((cap) => {
  const frame = cap.closest('.plate-frame');
  if (canHover) {
    cap.addEventListener('mouseenter', () => drawLead(cap));
    cap.addEventListener('mouseleave', () => frame && clearLeads(frame));
  }
  cap.addEventListener('focus', () => drawLead(cap));
  cap.addEventListener('blur', () => frame && clearLeads(frame));
});
