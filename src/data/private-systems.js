/* The two systems that are being built and stay closed.
 *
 * One source, two consumers: the #private plate cards (index.astro) and the
 * overview index rows (overview.js). Before this file the questions lived as
 * hardcoded strings in index.astro, so a second consumer would have meant a
 * second copy — the DEF-27/DEF-29 drift class, rebuilt as data.
 *
 * EvalAxis's figure traces to docs/evidence/projects/private.md (the package-C
 * re-audit section), measured at sibling commit c3233de: 12,978 committed
 * Python lines — the earlier 13,769 counted two gitignored 791-line scripts
 * the repository does not carry — and 388 `def test_` functions
 * (`--collect-only` gives 426 after parametrisation — a different metric,
 * deliberately not quoted here).
 * Aegis carries no figure: nothing is built, and a figure would be invented.
 */

export const privateSystems = {
  evalaxis: {
    name: 'EvalAxis',
    state: 'In progress · closed',
    q:
      '“Why can a failing test stop a release, when a measured drop in answer quality ' +
      'cannot?”',
    desc:
      'Evaluates LLM, RAG, and agent changes with evidence — and blocks CI on a quality ' +
      'regression.',
    line: 'Blocks a release when answer quality drops, the way a failing test would.',
    figure: '12,978 lines · 388 test functions',
  },
  aegis: {
    name: 'Aegis Contracts',
    state: 'In progress · closed',
    q: '“What should one AI system be allowed to promise another — and who checks?”',
    desc: 'Early-stage work on contract-shaped guarantees between AI systems.',
    line: 'Rules for what one AI system may promise another.',
    figure: null,
  },
};
