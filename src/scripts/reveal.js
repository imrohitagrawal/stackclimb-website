// Phase 2 scroll entry (improve-animations plan 001). Progressive enhancement
// only: motion.css shows every plate fully visible by default until THIS
// script proves it can reveal them on scroll (html.motion-ready) — if this
// file throws on line one, every plate stays exactly as visible as before.
// That is the bar every control on this site has to clear (DEF-1).
//
// Skips entirely under prefers-reduced-motion or the persisted footer toggle
// — both are already forced fully-visible by motion.css, so there is nothing
// for the observer to reveal.

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const toggledOff = document.documentElement.dataset.motion === 'off';

if (!reduced && !toggledOff && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-ready');

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.plate:not(.hero)').forEach((plate) => io.observe(plate));
}
