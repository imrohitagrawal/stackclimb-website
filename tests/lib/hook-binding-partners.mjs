/* The STATIC half of tests/hook-binding-selftest.mjs: what must be true of
   `.githooks/pre-commit` and `package.json` by inspection, before any commit
   is attempted. Split out under the D8 budget — one concern per file, and this
   one is "read the two files and check them", not "drive a git repo".

   Why these exist at all. Every check in the self-test's other half counts a
   REFUSAL. Against a deleted, emptied, or de-fanged hook those refusals simply
   stop happening, and a refusal-only suite reports nothing wrong — it would
   certify sameness rather than correctness. These assert that the thing being
   counted exists.

   Each carries its own `RED WHEN:`. */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { git } from './hook-binding-repo.mjs';

const FOUR = ['tests/no-pii.mjs --staged', 'assets/inbox/', '.env', 'gitleaks'];

/* Returns the check list plus the `prepare` script string, which the
   behavioural half needs. */
export function staticPartners(repo) {
  const out = [];
  const add = (name, ok, detail = '') => out.push({ name, ok, detail });

  const hook = join(repo, '.githooks/pre-commit');
  const bytes = existsSync(hook) ? statSync(hook).size : 0;
  // RED WHEN: `: > .githooks/pre-commit`, or `rm .githooks/pre-commit`.
  add('the hook file exists and is not empty', bytes > 0, `${bytes} bytes`);

  const mode = git(repo, 'ls-files', '-s', '--', '.githooks/pre-commit').out.split(/\s+/)[0];
  /* RED WHEN: `git update-index --chmod=-x .githooks/pre-commit`. Git declines
     to run a hook that is not executable — with a hint, not an error — so every
     clone would get the file and still have no gate. */
  add('the hook is tracked executable (100755)', mode === '100755', `git ls-files -s says ${mode || 'untracked'}`);

  const text = bytes ? readFileSync(hook, 'utf8') : '';
  const present = FOUR.filter((s) => text.includes(s));
  // RED WHEN: delete any one of the hook's four checks.
  add('the hook still carries all four of its checks', present.length === FOUR.length, `${present.length}/4 present`);

  /* Rules 1-3 get behavioural checks in the other half: a real commit is
     attempted and refused. Rule 4 does not, and this pair is the honest
     substitute.

     Why there is no behavioural check for gitleaks: the hook runs it only
     `if command -v gitleaks`, and the ubuntu-latest runner has no gitleaks
     binary on PATH — VERIFIED, not assumed: the CI log for this very step
     contains zero gitleaks output, while the same step on a laptop with
     gitleaks 8.30.1 installed prints its scan lines. The one machine that must
     never be wrong is the machine that never runs the rule.

     The bare substring `gitleaks` above is not enough on its own. A reviewer
     proved it: changing `|| fail=1` to `|| true`, and replacing the whole
     block with a comment, each left every check GREEN. These two assert the
     call AND that its result is still wired to the failure flag.
     RED WHEN: change `|| fail=1` to `|| true` on the gitleaks line, or delete
     the `gitleaks protect --staged` call. */
  add('the hook still CALLS gitleaks, not just mentions it', text.includes('gitleaks protect --staged'));
  const leakLine = text.split('\n').find((l) => l.includes('gitleaks protect')) ?? '';
  add('and the gitleaks result is still wired to the failure flag', /\|\|\s*fail=1/.test(leakLine), leakLine.trim());

  const pkg = JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8'));
  const prepare = pkg.scripts?.prepare ?? '';
  /* RED WHEN: remove the `prepare` script — which is exactly the DEF-62 state
     the whole self-test exists to close. */
  add('package.json carries a prepare script', prepare.length > 0, prepare || 'absent');

  /* Quotes are stripped before the test, and `$` counts as absolute-ish: the
     token in `git config core.hooksPath "$PWD/.githooks"` begins with `"`, so
     an earlier version of this check stayed GREEN on the exact mutation its
     RED WHEN names. Found by a reviewer running that mutation. The runtime
     read-back check in the other half caught it, which is why the suite still
     failed — but a check whose stated trigger does not trigger it is worse
     than no check, because it is read as coverage.
     RED WHEN: write `git config core.hooksPath "$PWD/.githooks"`. An absolute
     path is DEF-62 itself: correct on the machine that ran it, absent
     everywhere else, and pointed at the main checkout from inside every
     linked worktree. */
  const tokens = prepare.split(/\s+/).map((t) => t.replace(/["']/g, ''));
  const absolute = tokens.some((t) => /^[/~$]/.test(t) || t.includes(repo));
  add('the prepare script names no absolute path', prepare.length > 0 && !absolute, prepare || 'absent');

  /* Everything above proves the prepare COMMAND is right. This proves npm
     actually RAN it in this checkout — the one link the rest of the suite
     cannot see, because it executes the script itself with `sh` rather than
     going through npm.

     Found by a cross-model reviewer, who reproduced it: adding an `.npmrc`
     with `ignore-scripts=true` leaves the hook unbound and every other check
     still passes. There is no tracked `.npmrc` today (`git ls-files` finds
     none), which is exactly why a silent one would go unnoticed.

     Two modes, both with content. Under CI, gates.yml has already run
     `npm ci` in this job, so the binding must be in place — RED WHEN an
     `.npmrc` disables lifecycle scripts, or the prepare script is removed.
     Off CI, an unset value is fine (nobody has installed yet), but an
     ABSOLUTE value is DEF-62 itself sitting on this very machine — RED WHEN
     someone re-runs `git config core.hooksPath "$PWD/.githooks"` by hand. */
  const live = git(repo, 'config', '--local', '--get', 'core.hooksPath').out;
  const ci = Boolean(process.env.GITHUB_ACTIONS);
  add(
    ci ? 'CI: npm ci really bound the hook in this checkout'
      : 'this checkout is not bound to an absolute path',
    ci ? live === '.githooks' : live === '' || live === '.githooks',
    `core.hooksPath = "${live}"${!ci && live === '' ? ' (npm install not run here yet)' : ''}`,
  );

  return { results: out, prepare };
}
