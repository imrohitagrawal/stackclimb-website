// Measures the contrast a person actually sees, by rendering the text three
// times and reading the answer off the pixels.
// ---------------------------------------------------------------------------
// WHY THIS EXISTS, and why it is not the fourth patch to a pixel offset.
//
// DEF-46. Four previous attempts all tried to locate an element's backdrop by
// GEOMETRY — a pixel above the box, the bounding corners, a fixed gap outside,
// the element's own background composited in. Each produced a new false
// positive, because each rested on the same false assumption: that you can work
// out where the backdrop is from the element's box.
//
//   above the box     read the bar behind an ochre-filled chip: 1.16:1 for a
//                     pair that really measures ~6:1
//   corners           read the focus ring, because the chip is a 999px pill and
//                     a pill's bounding corners lie outside it: 2.65:1
//   fixed gap         landed on the ring again, at outline-offset 3px: 2.15:1
//   composite own bg  reported no background while the same probe read that
//                     background as ochre
//
// The architecture was wrong, not the offset. systematic-debugging's Phase 4.5
// names this exactly: three or more failed fixes, each revealing a new problem
// somewhere else, means question the pattern rather than attempt fix number
// five.
//
// THE METHOD. Render the same region three times — see THREE RENDERS below for
// why the third is not optional:
//
//   A = the page as it is
//   B = the page with ONLY the glyph fill removed
//
// B is then the exact backdrop beneath every pixel of text — through pills,
// gradients, background images, mix-blend-mode, transforms and translucency,
// because the renderer produced it rather than a formula. Pixels where A and B
// differ ARE the glyphs. For each such pixel the foreground is A and the
// backdrop is B at the same coordinate. Nothing is inferred.
//
// Three consequences worth stating:
//
//   - Element opacity needs no compositing maths. A is the RENDERED result, so
//     text at opacity 0.2 already reads as its faint on-screen colour.
//   - Outlines, borders and shadows are identical in A and B, so they cancel
//     and can never be mistaken for text. That kills the focus-ring false
//     positive at the root.
//   - :hover and :focus-visible cost nothing extra. Apply the state, take the
//     shots, and the method is unchanged.
//
// -webkit-text-fill-color, NOT color. `color: transparent` would also blank
// anything drawn with currentColor — and .site-nav .chip is
// `border: 1px solid currentColor`, so its border would vanish in B, register
// as a difference, and be measured as if it were text.
// -webkit-text-fill-color paints only the glyph interior and leaves
// currentColor alone. It is the precise instrument for this.
//
// THREE RENDERS, NOT TWO — and the second version of this file needed the
// third. Taking the glyph pixels to be "where A differs from B" fails on
// exactly the case the gate exists for: when text is nearly the colour of its
// backdrop, A and B barely differ, so low contrast is indistinguishable from
// NO TEXT. Measured: a deliberately awful #c49a45-on-#c99b3f hover reported
// "no text" and the harness scored it green.
//
// So a third render locates the glyphs independently of their real colour:
//
//   B = glyph fill transparent            -> the backdrop
//   M = glyph fill a known probe colour   -> the coverage mask
//   A = the page as it is                 -> the real rendered text
//
// Because M is composited as probe*a + backdrop*(1-a), per-pixel coverage `a`
// is recoverable: a = (M - B) / (probe - B), read on whichever channel has the
// largest |probe - backdrop| for numerical stability. The pixel of highest
// coverage is the core of a stroke, and that is where the foreground is read
// from A and the backdrop from B. WebAIM's manual technique says the same
// thing in other words: magnify, and sample the core of a stroke.
//
// The probe colour is chosen per-run as the one furthest from the backdrop, so
// it can never coincide with it.

const CLEAR_TEXT_ID = '__rc_clear_text__';

// The mask probe. Magenta is far from this site's entire palette — bone, ochre,
// and six near-black grounds — so `probe - backdrop` is always large. The code
// checks that span per pixel anyway and skips any pixel where it is not, so a
// site whose backdrop really is magenta degrades to "fewer measured pixels",
// never to a wrong number.
const PROBE_CSS = 'rgb(255, 0, 255)';
const PROBE_RGB = [255, 0, 255];

/** Contrast maths, WCAG 2.1. Both arguments are [r,g,b] 0-255. */
export function ratio(a, b) {
  const rel = (c) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const [hi, lo] = [rel(a), rel(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Measure the rendered contrast of one element.
 *
 * @param page        Playwright page
 * @param selector    CSS selector for the element whose TEXT is measured
 * @param opts.state  'rest' | 'hover' | 'focus'
 * @param opts.clip   optional {x,y,width,height} region; defaults to the
 *                    element's box padded outward, clamped to the viewport
 * @returns {{ratio, fg, bg, coveredPixels, totalPixels}} or null if the element
 *          renders no text at all (which the caller must treat as a denominator
 *          failure, never as a pass).
 */
export async function measure(page, selector, opts = {}) {
  const state = opts.state ?? 'rest';
  const el = page.locator(selector).first();
  if (!(await el.isVisible())) return null;

  if (state === 'hover') await el.hover();
  if (state === 'focus') await el.focus();
  if (state !== 'rest') await page.waitForTimeout(150);

  const clip = opts.clip ?? (await el.evaluate((n) => {
    const r = n.getBoundingClientRect();
    const pad = 2;
    return {
      x: Math.max(0, Math.floor(r.x - pad)),
      y: Math.max(0, Math.floor(r.y - pad)),
      width: Math.min(window.innerWidth, Math.ceil(r.width + pad * 2)),
      height: Math.min(window.innerHeight, Math.ceil(r.height + pad * 2)),
    };
  }));
  if (clip.width < 1 || clip.height < 1) return null;

  const shotA = await page.screenshot({ clip });

  // Remove ONLY the glyph fill, for this element and its descendants.
  await page.evaluate(
    ([sel, id]) => {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `${sel}, ${sel} * { -webkit-text-fill-color: transparent !important; }`;
      document.head.appendChild(s);
    },
    [selector, CLEAR_TEXT_ID],
  );

  // Re-assert the state: injecting a stylesheet does not move the mouse or
  // blur focus, but re-asserting costs nothing and removes the doubt that
  // cost four hours the first time round.
  if (state === 'hover') await el.hover();
  if (state === 'focus') await el.focus();
  await page.waitForTimeout(60);

  const shotB = await page.screenshot({ clip });

  // Third render: glyphs forced to a probe colour, to get the coverage mask.
  await page.evaluate(
    ([sel, id, probe]) => {
      const s = document.getElementById(id);
      s.textContent = `${sel}, ${sel} * { -webkit-text-fill-color: ${probe} !important; }`;
    },
    [selector, CLEAR_TEXT_ID, PROBE_CSS],
  );
  if (state === 'hover') await el.hover();
  if (state === 'focus') await el.focus();
  await page.waitForTimeout(60);
  const shotM = await page.screenshot({ clip });

  await page.evaluate((id) => document.getElementById(id)?.remove(), CLEAR_TEXT_ID);

  return page.evaluate(
    async ([a64, b64, m64, probe]) => {
      const load = async (b64s) => {
        const img = new Image();
        await new Promise((r) => { img.onload = r; img.src = `data:image/png;base64,${b64s}`; });
        const cv = document.createElement('canvas');
        cv.width = img.width; cv.height = img.height;
        cv.getContext('2d').drawImage(img, 0, 0);
        return cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
      };
      const A = await load(a64);
      const B = await load(b64);
      const M = await load(m64);

      let best = -1;
      let fg = null;
      let bg = null;
      let covered = 0;
      const total = (A.length / 4) | 0;

      for (let i = 0; i < A.length; i += 4) {
        // Coverage from the MASK render, which is independent of the text's
        // real colour. Read on the channel where the probe is furthest from
        // this pixel's backdrop, so the division is well conditioned.
        let ch = 0, span = -1;
        for (let c = 0; c < 3; c++) {
          const sp = Math.abs(probe[c] - B[i + c]);
          if (sp > span) { span = sp; ch = c; }
        }
        if (span < 8) continue;                       // probe ~= backdrop here
        const a = (M[i + ch] - B[i + ch]) / (probe[ch] - B[i + ch]);
        if (!(a > 0.06)) continue;                    // not inked
        covered++;
        if (a > best) {
          best = a;
          fg = [A[i], A[i + 1], A[i + 2]];
          bg = [B[i], B[i + 1], B[i + 2]];
        }
      }

      if (!fg) return { ratio: null, fg: null, bg: null, coveredPixels: 0, totalPixels: total };

      const rel = (c) => {
        const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
        return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
      };
      const l = [rel(fg), rel(bg)].sort((x, y) => y - x);
      return {
        ratio: (l[0] + 0.05) / (l[1] + 0.05),
        fg, bg,
        coveredPixels: covered,
        totalPixels: total,
      };
    },
    [shotA.toString('base64'), shotB.toString('base64'), shotM.toString('base64'), PROBE_RGB],
  );
}


/**
 * Measure EVERY element matching `selector` from ONE set of three renders.
 *
 * The single-element `measure` costs three screenshots per element per state.
 * A scroll sweep over 58 positions × 4 links would be 696 screenshots, which is
 * unaffordable. The glyph-clearing rule applies to all matches at once, so one
 * triple of the whole bar answers for every link in it — 3 shots per position
 * rather than 3 per link. Regions are then cropped out of those same images.
 *
 * @returns array of {text, ratio, fg, bg, coveredPixels} — ratio null where an
 *          element rendered no measurable glyph, which the caller MUST treat as
 *          a denominator failure rather than a pass.
 */
export async function measureMany(page, selector, clip) {
  const boxes = await page.$$eval(selector, (els, c) => els.map((e) => {
    const r = e.getBoundingClientRect();
    return {
      text: e.textContent.trim().replace(/\s+/g, ' ').slice(0, 22),
      x: Math.round(r.x - c.x), y: Math.round(r.y - c.y),
      w: Math.round(r.width), h: Math.round(r.height),
      visible: r.width > 1 && r.height > 1 &&
        getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none',
    };
  }), clip);

  const shotA = await page.screenshot({ clip });
  await page.evaluate(([sel, id]) => {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `${sel}, ${sel} * { -webkit-text-fill-color: transparent !important; }`;
    document.head.appendChild(s);
  }, [selector, CLEAR_TEXT_ID]);
  const shotB = await page.screenshot({ clip });

  await page.evaluate(([sel, id, probe]) => {
    document.getElementById(id).textContent =
      `${sel}, ${sel} * { -webkit-text-fill-color: ${probe} !important; }`;
  }, [selector, CLEAR_TEXT_ID, PROBE_CSS]);
  const shotM = await page.screenshot({ clip });
  await page.evaluate((id) => document.getElementById(id)?.remove(), CLEAR_TEXT_ID);

  return page.evaluate(async ([a64, b64, m64, probe, bxs, cw, ch]) => {
    const load = async (b) => {
      const img = new Image();
      await new Promise((r) => { img.onload = r; img.src = `data:image/png;base64,${b}`; });
      const cv = document.createElement('canvas');
      cv.width = img.width; cv.height = img.height;
      cv.getContext('2d').drawImage(img, 0, 0);
      return { d: cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, w: cv.width, h: cv.height };
    };
    const A = await load(a64), B = await load(b64), M = await load(m64);
    const rel = (c) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };

    return bxs.map((bx) => {
      if (!bx.visible) return { text: bx.text, ratio: null, visible: false, coveredPixels: 0 };
      let best = -1, fg = null, bg = null, covered = 0;
      const x0 = Math.max(0, bx.x), y0 = Math.max(0, bx.y);
      const x1 = Math.min(A.w, bx.x + bx.w), y1 = Math.min(A.h, bx.y + bx.h);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * A.w + x) * 4;
          let chn = 0, span = -1;
          for (let c = 0; c < 3; c++) {
            const sp = Math.abs(probe[c] - B.d[i + c]);
            if (sp > span) { span = sp; chn = c; }
          }
          if (span < 8) continue;
          const a = (M.d[i + chn] - B.d[i + chn]) / (probe[chn] - B.d[i + chn]);
          if (!(a > 0.06)) continue;
          covered++;
          if (a > best) {
            best = a;
            fg = [A.d[i], A.d[i + 1], A.d[i + 2]];
            bg = [B.d[i], B.d[i + 1], B.d[i + 2]];
          }
        }
      }
      if (!fg) return { text: bx.text, ratio: null, visible: true, coveredPixels: 0 };
      const l = [rel(fg), rel(bg)].sort((p, q) => q - p);
      return { text: bx.text, ratio: (l[0] + 0.05) / (l[1] + 0.05), fg, bg, visible: true, coveredPixels: covered };
    });
  }, [shotA.toString('base64'), shotB.toString('base64'), shotM.toString('base64'), PROBE_RGB, boxes, clip.width, clip.height]);
}
