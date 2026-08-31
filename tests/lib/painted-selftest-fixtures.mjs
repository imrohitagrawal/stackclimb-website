// Fixture data for tests/painted-selftest.spec.js, split out under D8's
// 250-line module cap. [label, inline style on #t, extra CSS, shape] tuples;
// shapes are keys into BODIES, consumed by that file's build() helper.

const GRAD = '#wrap{background:linear-gradient(#f00,#00f)}';

/* [label, inline style on #t, extra CSS, shape]. Shapes are in build(). */
export const HOLES = [
  // --- LEAF shape: #t is a <p> holding its own text ---
  ['white-on-white', 'color:#fff', ''],
  ['white-on-white over a coloured ancestor', 'color:#123456', '#wrap{background:#123456}'],
  ['1px tall + overflow hidden', 'height:1px;overflow:hidden', ''],
  // Pins the floor's LOWER bound. G1 only proves the floor is not absent;
  // without a case between 2 and 4px, lowering it to >= 2 stays green.
  ['3px tall — just under the 4px floor', 'height:3px;overflow:hidden', ''],
  ['ancestor overflow:hidden height:0', '', '#wrap{height:0;overflow:hidden}'],
  ['ancestor overflow:clip height:0', '', '#wrap{height:0;overflow:clip}'],
  // A plain wrapper sits between #t and the clipping ancestor: narrowing the
  // walk to the direct parent stays green without this row.
  ['GRANDPARENT overflow:hidden height:0', '', '#wrap{height:0;overflow:hidden}', 'NESTED'],
  // Horizontal clip. #t keeps its own 400px rect and overflows right, so the
  // x-axis intersection is the only thing that catches it.
  ['ancestor width:0 overflow:hidden, text overflowing right', 'width:400px', '#wrap{width:0;overflow:hidden}'],
  // The explicit height is load-bearing: a bare content-visibility:hidden
  // collapses the box, so the 4px floor catches it and this line's mutation
  // reports a false green.
  ['content-visibility:hidden WITH an explicit height', 'content-visibility:hidden;height:50px', ''],
  ['transform:scale(0)', 'transform:scale(0)', ''],
  ['transform:scale(0.02)', 'transform:scale(0.02)', ''],
  ['font-size:0 with padding, and a child element', 'font-size:0;padding:20px', ''],
  // No child element at all: with a child present, dropping `el` from the node
  // set still catches it via the child, and the mutation reports a false green.
  ['font-size:0 with padding, LEAF with no child element', 'font-size:0;padding:20px', '', 'BARE'],
  ['color:transparent (the legacy syntax)', 'color:transparent', ''],
  // These four MUST sit over a gradient. Over a flat backdrop the identity
  // check catches alpha-0 as a side effect, the fill-alpha mutation reports a
  // false green, and that line looks unnecessary.
  ['color(srgb 0 0 0 / 0) over a gradient', 'color:color(srgb 0 0 0 / 0)', GRAD],
  ['oklch(0 0 0 / 0) over a gradient', 'color:oklch(0 0 0 / 0)', GRAD],
  [
    'color-mix(in srgb, #111 0%, transparent) over a gradient — the site idiom',
    'color:color-mix(in srgb,#111 0%,transparent)',
    GRAD,
  ],
  ['-webkit-text-fill-color:transparent over a gradient', '-webkit-text-fill-color:transparent', GRAD],
  ['lab(0 0 0 / 0) over a gradient', 'color:lab(0 0 0 / 0)', GRAD],
  ['the sr-only 1x1 clip idiom', 'position:absolute;width:1px;height:1px;overflow:hidden', ''],
  // Matrix rows 11, 13: filter/clip-path anywhere on el's own ancestor chain.
  // Walk 1's opening loop, distinct from every clip/size case above, none of
  // which sets either property.
  ['filter:blur(1px) on el itself', 'filter:blur(1px)', ''],
  ['clip-path:inset(50%) on el itself', 'clip-path:inset(50%)', ''],
  // Matrix row 21 (off-screen NEGATIVE direction). Every existing clip
  // fixture clips via overflow/size, never by moving the box past the
  // document's left/top edge.
  ['off-screen negative: left:-9999px', 'position:absolute;left:-9999px', ''],
  // Matrix row 55 (checkVisibility's own display:none coverage) and row 61
  // (visibility:collapse, distinct from visibility:hidden). Neither value
  // had its own fixture; both are asserted here as coverage claims, not
  // assumptions.
  ['display:none on el itself', 'display:none', ''],
  ['visibility:collapse on el itself', 'visibility:collapse', ''],
  // --- CONTAINER shape: #t is a <div> whose only text is in .inner ---
  ['CONTAINER, child color:transparent', '', '.inner{color:transparent}', 'CONTAINER'],
  [
    'CONTAINER, child color-mix 0% — the site idiom',
    '',
    '.inner{color:color-mix(in srgb,#111 0%,transparent)}',
    'CONTAINER',
  ],
  [
    'CONTAINER, child -webkit-text-fill-color:transparent',
    '',
    '.inner{-webkit-text-fill-color:transparent}',
    'CONTAINER',
  ],
  ['CONTAINER, child white-on-white', '', '.inner{color:#fff}', 'CONTAINER'],
  ['CONTAINER, child opacity:0', '', '.inner{opacity:0}', 'CONTAINER'],
  ['CONTAINER, child visibility:hidden', '', '.inner{visibility:hidden}', 'CONTAINER'],
  ['CONTAINER, child font-size:0 — all of its text', '', '.inner{font-size:0}', 'CONTAINER'],
  // DEF-80. Every prior CONTAINER fixture put the text one level below #t
  // (#t > .inner). A regression that narrows the descendant walk from
  // el.querySelectorAll('*') to ':scope > *' still passes every one of them,
  // because a direct child is still ':scope > *'. This one puts the text a
  // full GRANDCHILD down (#t > .mid > .inner), which only the wider,
  // unnarrowed walk can reach — the fixture pair the contract's row 5 exists
  // to require.
  ['GRANDCHILD, text two levels deep, transparent', '', '.inner{color:transparent}', 'GRANDCHILD'],
  // Matrix row 31 (stacked backdrops). REDESIGNED after review round 2 found
  // the first draft of this fixture could not discriminate: white text over
  // ANY non-matching backdrop reads as visible whether the multi-layer walk
  // composites correctly or stops short at the first non-opaque layer and
  // fails open (painted.mjs's own `!layers.length || last-layer-not-opaque`
  // branch returns true either way). This version closes that gap: text is
  // filled the EXACT byte value the two layers correctly composite to
  // (255*0.5 + 0*0.5 = 127.5, rounds to 128 on both paths), so a CORRECT
  // walk reads identity-match (false, this HOLE); a walk that stops short
  // and only sees the translucent .mid layer fails open and reads true —
  // flipping this fixture, not leaving it silently unchanged.
  [
    'TWO-LAYER backdrop: fill matches the CORRECT composite of a translucent tint over opaque black',
    'color:rgb(128,128,128)',
    '.mid{background:rgba(255,255,255,.5)} #wrap{background:rgb(0,0,0)}',
    'NESTED',
  ],
];

export const KEEPERS = [
  ['ordinary body text', '', ''],
  ['11px type  [THE REFUSED FLOOR]', 'font-size:11px', ''],
  ['11.52px small caps', 'font-size:11.52px;letter-spacing:.08em', ''],
  [
    'ochre on olive, 4.62:1 — the site\'s lowest real pair',
    'color:rgb(201,155,63)',
    '#wrap{background:rgb(65,55,24)}',
  ],
  ['an 18.4px-tall row — the site\'s smallest real box', 'font-size:11.52px;height:18.4px;overflow:hidden', ''],
  [
    'translucent color(srgb .. / .88) — the site\'s own colour idiom',
    'color:color(srgb 0.94902 0.921569 0.866667 / 0.88)',
    '#wrap{background:#16213c}',
  ],
  ['a real scroll container ancestor, not clipping to 0', '', '#wrap{height:400px;overflow:auto}'],
  ['a font-size:0 wrapper whose text lives in a sized child', 'font-size:0', '', 'EMPTYBOX'],
  // MOVED FROM HOLES in round 2. A reader sees "Some real readable text"; only
  // the trailing span is zero-sized. Shipping this as a HOLE baked a false red
  // into the receipt and is what forced the at-least-one rule.
  ['a zero-sized span BESIDE visible text', '', '#t span{font-size:0}'],
  // The container partner for the same rule. This site has NO sr-only class
  // (grep over src/styles, src/components, src/pages, src/layouts finds none
  // — the only hit is the words "screen-reader" in a prose comment), so this
  // fixture is synthetic on purpose: it is what stops someone "fixing" a
  // future finding with an every-node rule.
  ['CONTAINER whose visible text sits beside a HIDDEN child', '', '', 'SRONLY'],
  // Without the abandon guard these FALSE-RED: the backdrop walk finds no
  // opaque background-COLOR, falls through to the white page default, and
  // matches white-on-white. DEF-46's lesson inside one fixture.
  [
    'an ancestor painting a background-IMAGE behind the text',
    'color:#fff',
    '#wrap{background-image:linear-gradient(#000,#111)}',
  ],
  ['an ancestor carrying mix-blend-mode', 'color:#f2ebdd', '#wrap{background:#16213c;mix-blend-mode:overlay}'],
  // Restored from tests/painted-alpha-selftest.spec.js (deleted this package —
  // ADVISORY_DEBT, review round 1): the case the FIRST regex false-redded, by
  // capturing the blue channel of an opaque colour instead of the alpha byte.
  ['opaque rgb() black — the case the FIRST regex false-redded', 'color:rgb(0,0,0)', ''],
  // Matrix row 26 (element opacity:0.01) and row 37 (fill alpha 0.01) are
  // DIFFERENT axes — the first is a property painted() never reads at all,
  // the second is read and rejected only at exactly zero. Both restored/added
  // here as declared-limitation KEEPERS: this function says PAINTED for both.
  ['opacity:0.01 on el — a property painted() never reads', 'opacity:0.01', ''],
  ['fill alpha 0.01 via rgba(...,0.01) — reads zero only, not faint', 'color:rgba(17,17,17,0.01)', ''],
];

export const BODIES = {
  LEAF: '<div id="wrap"><p id="t">Some real readable text <span>tail</span></p></div>',
  BARE: '<div id="wrap"><p id="t">Some real readable text</p></div>',
  EMPTYBOX: '<div id="wrap"><p id="t"><span style="font-size:16px">visible child text</span></p></div>',
  CONTAINER: '<div id="wrap"><div id="t"><p class="inner">real readable text</p></div></div>',
  GRANDCHILD:
    '<div id="wrap"><div id="t"><div class="mid"><p class="inner">real readable text</p></div></div></div>',
  NESTED: '<div id="wrap"><div class="mid"><p id="t">Some real readable text <span>tail</span></p></div></div>',
  SRONLY:
    '<div id="wrap"><div id="t"><p class="inner">real readable text</p>' +
    '<p class="hid" hidden>collapsed helper text</p></div></div>',
};
