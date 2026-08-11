// Item 5 — the footer animation toggle. docs/HANDOFF.md's own spec:
// "animation ON by default with a footer toggle persisted in localStorage."
//
// `[data-motion='off']` on <html> is a PERSISTED user preference, read from
// localStorage before first paint by the inline script in Layout.astro's
// <head> (so there is no flash of the wrong state) and written here on every
// toggle. It is deliberately a DIFFERENT mechanism from `html.no-anim`
// (src/scripts/plates.js's transient ~400ms suppression during an anchor
// jump) — see motion.css's header comment for why they stay separate in code
// even though both resolve to "kill transitions and animations."
//
// prefers-reduced-motion is never read or written here: it always wins at
// the CSS layer (motion.css and nav.css each gate on it
// independently), so a visitor's OS-level accessibility setting can never be
// overridden by this site-level toggle.

const html = document.documentElement;
const button = document.getElementById('motion-toggle');

if (button) {
  const label = button.querySelector('[data-motion-label]');

  const sync = () => {
    const off = html.dataset.motion === 'off';
    button.setAttribute('aria-pressed', String(off));
    if (label) label.textContent = off ? 'off' : 'on';
  };

  // The inline head script may have already set data-motion='off' from a
  // previous visit before this script ever runs — reflect that now.
  sync();

  button.addEventListener('click', () => {
    const off = html.dataset.motion === 'off';
    if (off) {
      delete html.dataset.motion;
      localStorage.removeItem('motion');
    } else {
      html.dataset.motion = 'off';
      localStorage.setItem('motion', 'off');
    }
    sync();
  });
}
