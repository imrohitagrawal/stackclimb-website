// Portrait-plate behaviors:
// 1. The backdrop repaints as each plate takes the easel (scroll).
// 2. Captions draw a leader line to the garment they name (hover/focus).

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;
const html = document.documentElement;
const SVG_NS = 'http://www.w3.org/2000/svg';

/* ---------- backdrop repaint ---------- */

const plates = Array.from(document.querySelectorAll('.plate'));

const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const { hue, plateTheme } = entry.target.dataset;
      if (hue) html.style.setProperty('--bg', hue);
      html.dataset.theme = plateTheme === 'light' ? 'light' : 'dark';
    }
  },
  // Fire when a plate crosses the middle band of the viewport,
  // so tall plates on small screens still register.
  { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
);

plates.forEach((p) => io.observe(p));

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
  if (target) {
    target.scrollIntoView({ behavior: 'auto', block: 'start' });
    const { hue, plateTheme } = target.dataset;
    if (hue) html.style.setProperty('--bg', hue);
    html.dataset.theme = plateTheme === 'light' ? 'light' : 'dark';
  }
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
