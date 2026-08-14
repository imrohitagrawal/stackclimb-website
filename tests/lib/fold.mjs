/* The repo's evasion-fold, extracted from proof-act.spec.js at 263/250
   (D8: modularize, never trim). Cf-strip FIRST: soft hyphens, zero-widths
   and word joiners (U+00AD, U+200B-200D, U+2060, FEFF) evade both
   dash-unification and substring bars — the Codex 'Ora​cle' and
   '&shy;' findings. Then NFKC, dash-unify, whitespace-collapse. */
export const norm = (s) => s.replace(/\s+/g, ' ').trim();
export const fold = (s) =>
  norm(
    s.normalize('NFKC').replace(/\p{Cf}/gu, '').replace(/\p{Pd}/gu, '-').replace(/\s/gu, ' '),
  );
