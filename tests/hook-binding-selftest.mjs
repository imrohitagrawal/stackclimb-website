/* Proves the pre-commit hook is BOUND by something every clone gets, and that
   once bound it blocks the four things it claims to — and still lets ordinary
   work through.

   DEF-62: `core.hooksPath` was set to an ABSOLUTE path inside `.git/config`, a
   file git never clones. So the hook ran on exactly one laptop, in exactly one
   working tree, while `docs/STATUS.md` row M4 and directive W-6 both said it
   was done. The fix is a `prepare` script in `package.json` — npm runs it on
   `npm install` AND on `npm ci` — setting `core.hooksPath` to the RELATIVE
   value `.githooks`, which git resolves against each working tree's own root.

   That second half is a separate defect, and it was MEASURED here rather than
   taken from git's docs: with the absolute value a linked worktree still ran a
   hook, but it ran the MAIN checkout's copy — so a branch that changed a hook
   check was never checked by its own version. An earlier draft of this file
   claimed the worktree commit check caught an absolute path; a mutation run
   refuted that in one command, and the last check below is what replaced it.

   Why a self-test and not a Playwright spec: the thing under test is git's own
   hook dispatch, and the only way to observe it is to attempt real commits.
   The throwaway repo they run in lives in tests/lib/hook-binding-repo.mjs.

   Both directions everywhere. Most checks below count a FAILURE, and a hook
   that fails every commit would satisfy all of them; the ordinary-file checks
   and the four PARTNER checks at the top are what stop that. Each check
   carries its own `RED WHEN:`.

   Run: node tests/hook-binding-selftest.mjs   (gates.yml, cheap job) */

import { accessSync, chmodSync, constants, existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  attemptCommit, buildFreshClone, CLEAN, DIRTY, firstLine, git, sh,
} from './lib/hook-binding-repo.mjs';

const REPO = process.cwd();
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

/* ── PARTNERS ─────────────────────────────────────────────────────
   Everything after this section counts refusals. Against a deleted, emptied,
   or de-fanged hook those refusals would simply stop happening, and a
   refusal-only suite would report nothing wrong. These assert that the thing
   being counted exists. */

const HOOK = join(REPO, '.githooks/pre-commit');
const bytes = existsSync(HOOK) ? statSync(HOOK).size : 0;
// RED WHEN: `: > .githooks/pre-commit`, or `rm .githooks/pre-commit`.
check('the hook file exists and is not empty', bytes > 0, `${bytes} bytes`);

const mode = git(REPO, 'ls-files', '-s', '--', '.githooks/pre-commit').out.split(/\s+/)[0];
// RED WHEN: `git update-index --chmod=-x .githooks/pre-commit`. Git declines
// to run a hook that is not executable — with a hint, not an error — so every
// clone would get the file and still have no gate.
check('the hook is tracked executable (100755)', mode === '100755', `git ls-files -s says ${mode || 'untracked'}`);

const hookText = bytes ? readFileSync(HOOK, 'utf8') : '';
const FOUR = ['tests/no-pii.mjs --staged', 'assets/inbox/', '.env', 'gitleaks'];
const present = FOUR.filter((s) => hookText.includes(s));
// RED WHEN: delete any one of the hook's four checks.
check('the hook still carries all four of its checks', present.length === FOUR.length, `${present.length}/4 present`);

const pkg = JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8'));
const prepare = pkg.scripts?.prepare ?? '';
// RED WHEN: remove the `prepare` script — which is exactly the DEF-62 state
// this whole file exists to close.
check('package.json carries a prepare script', prepare.length > 0, prepare || 'absent');

const tokens = prepare.split(/\s+/);
const absolute = tokens.some((t) => t.startsWith('/') || t.startsWith('~') || t.includes(REPO));
// RED WHEN: write `git config core.hooksPath "$PWD/.githooks"`. An absolute
// path is DEF-62 itself: correct on the machine that ran it, absent everywhere
// else, and pointed at the main checkout from inside every linked worktree.
check('the prepare script names no absolute path', prepare.length > 0 && !absolute, prepare || 'absent');

const tmpRoot = realpathSync(mkdtempSync(join(tmpdir(), 'hook-binding-')));
try {
  /* `prepare` runs on every `npm ci`, and gates.yml runs `npm ci` in three
     jobs. An unguarded failure would break CI on any machine without git, or
     when this package is installed as a dependency. Proved by running the
     script somewhere that is not a git repo, not by reading the `|| true`.
     RED WHEN: drop the `|| true` from the prepare script. */
  const outside = join(tmpRoot, 'not-a-git-repo');
  mkdirSync(outside);
  const guarded = sh(outside, prepare);
  check(
    'the prepare script exits 0 outside a git repo, so npm ci cannot break',
    prepare.length > 0 && guarded.code === 0,
    `exit ${guarded.code}${guarded.out ? `: ${firstLine(guarded.out)}` : ''}`,
  );

  const CLONE = buildFreshClone(REPO, tmpRoot);

  let executable = false;
  try {
    accessSync(join(CLONE, '.githooks/pre-commit'), constants.X_OK);
    executable = true;
  } catch { /* stays false */ }
  // RED WHEN: `chmod -x .githooks/pre-commit` — which is what losing the
  // tracked executable bit would do to every real clone.
  check('the hook arrives executable in the fresh clone', executable);

  /* ── Before prepare: DEF-62 reproduced ────────────────────────
     Also the partner for every refusal further down. If a planted number
     could not be committed HERE either, those refusals would prove nothing
     about the binding. */
  const unbound = git(CLONE, 'config', '--get', 'core.hooksPath').out;
  // RED WHEN: anything binds core.hooksPath for a fresh clone without npm.
  check('a fresh clone starts with no core.hooksPath — DEF-62 reproduced', unbound === '', `got "${unbound}"`);

  const beforeBinding = attemptCommit(CLONE, 'planted.md', DIRTY);
  // RED WHEN: the same, from the other side.
  check(
    'and the hook does not run there: a planted number commits cleanly',
    beforeBinding.staged && beforeBinding.code === 0,
    `staged ${beforeBinding.staged}, git commit exit ${beforeBinding.code}`,
  );

  const inboxUnbound = attemptCommit(CLONE, 'assets/inbox/planted.md', CLEAN);
  /* The second half of the reproduction, and the partner that pins the
     `.gitignore:81` trap: an inbox path must be genuinely stageable with -f,
     or "refused" below would only ever mean "git had nothing to commit". */
  check(
    'and an inbox file commits cleanly there too',
    inboxUnbound.staged && inboxUnbound.code === 0,
    `staged ${inboxUnbound.staged}, git commit exit ${inboxUnbound.code}`,
  );

  /* ── After prepare ─────────────────────────────────────────── */
  const bind = sh(CLONE, prepare);
  check('the prepare script runs clean in a fresh clone', prepare.length > 0 && bind.code === 0, `exit ${bind.code}`);

  const bound = git(CLONE, 'config', '--local', '--get', 'core.hooksPath').out;
  // RED WHEN: point the prepare script at any other directory.
  check('prepare binds core.hooksPath to the relative value .githooks', bound === '.githooks', `got "${bound}"`);
  // RED WHEN: make the binding absolute. Read from the value git actually
  // stored, not from the script text, so a shell expansion is caught too.
  check(
    'the stored value is relative, not an absolute path',
    bound.length > 0 && !bound.startsWith('/') && !bound.includes(REPO),
    `got "${bound}"`,
  );

  const dirty = attemptCommit(CLONE, 'planted.md', DIRTY);
  // RED WHEN: drop `node tests/no-pii.mjs --staged` from the hook.
  check('bound: a staged personal phone number is refused', dirty.refused, `git commit exit ${dirty.code}`);
  // RED WHEN: the commit fails for any reason OTHER than the PII scan — a
  // missing node, a bad path. An exit code alone cannot tell those apart, and
  // a hook that is simply ignored produces a git hint instead of this line.
  check(
    'bound: and it is the PII scan that refused, not something else',
    /phone|personal contact|commit blocked/i.test(dirty.out),
    firstLine(dirty.out),
  );

  const clean = attemptCommit(CLONE, 'ordinary.md', CLEAN);
  // RED WHEN: replace the hook body with `exit 1`. A blocker that blocks
  // everything is not a gate, and every refusal check here would still pass.
  check('bound: an ordinary file still commits', clean.code === 0, `git commit exit ${clean.code}`);

  const inbox = attemptCommit(CLONE, 'assets/inbox/planted.md', CLEAN);
  // RED WHEN: delete the assets/inbox/ block from the hook.
  check('bound: a file under assets/inbox/ is refused', inbox.refused, `git commit exit ${inbox.code}`);
  check('bound: and it is the inbox rule that refused', /inbox/.test(inbox.out), firstLine(inbox.out));

  const dotenv = attemptCommit(CLONE, '.env', 'EXAMPLE_SETTING=placeholder\n');
  // RED WHEN: delete the .env block from the hook.
  check('bound: a staged .env is refused', dotenv.refused, `git commit exit ${dotenv.code}`);
  check('bound: and it is the .env rule that refused', /\.env is staged/.test(dotenv.out), firstLine(dotenv.out));

  /* ── A linked worktree ─────────────────────────────────────── */
  const WT = join(tmpRoot, 'linked-worktree');
  const added = git(CLONE, 'worktree', 'add', '-q', WT, '-b', 'wt-selftest');
  check('a linked worktree can be created', added.code === 0, firstLine(added.out || 'ok'));
  check('the hook file is present in the linked worktree', existsSync(join(WT, '.githooks/pre-commit')));

  const wtDirty = attemptCommit(WT, 'planted.md', DIRTY);
  // RED WHEN: point the prepare script at a directory no worktree has. NOT red
  // for an absolute path — measured: an absolute core.hooksPath still fires in
  // a worktree, it just fires the wrong copy. That is the next check's job.
  check('the binding fires in a linked worktree too', wtDirty.refused, `git commit exit ${wtDirty.code}`);

  const wtClean = attemptCommit(WT, 'ordinary.md', CLEAN);
  check('and an ordinary file still commits there', wtClean.code === 0, `git commit exit ${wtClean.code}`);

  /* THIS is what separates a relative binding from an absolute one, and it was
     measured, not assumed. With an ABSOLUTE core.hooksPath a linked worktree
     runs the MAIN checkout's copy of the hook, so a worktree on a branch that
     adds or fixes a hook check silently runs the old one instead. With a
     relative value it runs its own. attemptCommit's `git reset --hard` puts
     the real hook back afterwards. RED WHEN: make the binding absolute. */
  const marker = 'WORKTREE-OWN-HOOK';
  writeFileSync(join(WT, '.githooks/pre-commit'), `#!/bin/sh\necho ${marker}\nexit 1\n`);
  chmodSync(join(WT, '.githooks/pre-commit'), 0o755);
  const wtOwn = attemptCommit(WT, 'ordinary.md', CLEAN);
  check(
    "the worktree runs its OWN copy of the hook, not the main checkout's",
    new RegExp(marker).test(wtOwn.out),
    firstLine(wtOwn.out),
  );
} finally {
  rmSync(tmpRoot, { recursive: true, force: true });
}

const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error(`\nSELF-TEST FAIL — ${failed.length} of ${results.length} checks failed`);
  process.exit(1);
}
console.log(`\nSELF-TEST PASS — ${results.length} checks; every clone and every worktree binds the hook`);
