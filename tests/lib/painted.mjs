/* painted() — the repo's standard is-it-actually-visible check, extracted
   from proof-act.spec.js when the RCA-005 rescope pushed that file to
   255/250 (D8: modularize, never trim). checkVisibility is ancestor-aware
   for opacity/visibility but NOT for filter/clip-path — the ancestor walk
   covers those (D85's built-fan hardening); the bounds checks reject
   off-screen "painted" elements (the Codex off-screen finding, D84). */
export const painted = (loc) =>
  loc.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const doc = document.documentElement;
    for (let a = el; a; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.filter !== 'none' || cs.clipPath !== 'none') return false;
    }
    // Fully transparent TEXT passes checkVisibility — `color: transparent`
    // hid the qualifier from every reader while staying "painted" (Codex
    // hole 12). Alpha 0 in the computed color is not painted.
    const color = getComputedStyle(el).color;
    const alpha = color.match(/rgba?\([^)]*[,/]\s*([\d.]+)\s*\)/);
    if (alpha && parseFloat(alpha[1]) === 0) return false;
    return (
      el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) &&
      r.right > 0 &&
      r.left >= 0 &&
      r.left < doc.scrollWidth &&
      r.bottom > 0 &&
      r.top < doc.scrollHeight
    );
  });
