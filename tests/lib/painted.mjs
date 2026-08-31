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
    /* Fully transparent TEXT passes checkVisibility — `color: transparent`
       hid the qualifier from every reader while staying "painted".
       THE RENDERER PARSES THE COLOUR, NOT US. The previous version split the
       computed string on commas and slashes and tested `parts.length === 4`.
       That was correct for the rgb()/rgba() world it was written in and became
       DEAD CODE when this site moved to `color-mix()`, which computes to
       `color(srgb 0 0 0 / 0)` — five components, so the length test never ran
       and fully invisible text passed. Nothing failed, because a guard that
       stops firing goes quiet rather than red. A 1x1 canvas fill hands the
       parsing to the engine, so there is no parser of ours left to be wrong:
       rgb, rgba, color(srgb ...), oklch, lab and color-mix's output all work.
       Reading `webkitTextFillColor` first also closes
       `-webkit-text-fill-color: transparent`, which paints the glyph interior.
       SCOPED, because the first draft of this sentence overreached: painted()
       did not catch it, and nothing outside the NAV did — tests/nav-contrast.mjs
       already fails a nav link that is visible but renders no measurable glyph.
       So this is new cover everywhere except the nav, not cover where there was
       none. src/styles/ does not use the property today, so it is prospective.
       KNOWN LIMIT, stated rather than discovered later: an unparseable colour
       leaves `fillStyle` at its previous value (opaque black), so this fails
       OPEN, exactly as the regex did. It reads the DECLARED fill on `el`, so
       it says nothing about a descendant's colour or about contrast against
       any backdrop — see tests/lib/rendered-contrast.mjs for real contrast. */
    const cvs = document.createElement('canvas');
    cvs.width = 1;
    cvs.height = 1;
    const ctx = cvs.getContext('2d', { willReadFrequently: true });
    const ecs = getComputedStyle(el);
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = ecs.webkitTextFillColor || ecs.color;
    ctx.fillRect(0, 0, 1, 1);
    if (ctx.getImageData(0, 0, 1, 1).data[3] === 0) return false;
    return (
      el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) &&
      r.right > 0 &&
      r.left >= 0 &&
      r.left < doc.scrollWidth &&
      r.bottom > 0 &&
      r.top < doc.scrollHeight
    );
  });
