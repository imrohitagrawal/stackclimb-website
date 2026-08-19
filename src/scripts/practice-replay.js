// The hero practice panel's "Replay" button. html.hero-anim is
// set once, pre-paint, and never removed — so there is no state to track
// here and no second copy of hero-practice.css's animation rules to keep
// in sync. A click just nulls `animation` inline on the panel's animated
// descendants, forces one reflow, then clears the override, and the same
// html.hero-anim rules restart from their `from` frame.
//
// Safe under prefers-reduced-motion or the persisted motion-off toggle
// with no extra check: those already zero out `animation` at the CSS
// layer (motion.css), so restoring an empty inline override re-applies
// nothing there either.

const panel = document.querySelector('.practice-panel');
const button = panel?.querySelector('.practice-replay');

if (panel && button) {
  const animated = panel.querySelectorAll(
    '.practice-fill, .practice-dot, .chip-pending, .chip-resolved, .state-pending, .state-done',
  );

  button.addEventListener('click', () => {
    animated.forEach((el) => {
      el.style.animation = 'none';
    });
    void panel.offsetHeight; // one reflow for the whole subtree
    animated.forEach((el) => {
      el.style.animation = '';
    });
  });
}
