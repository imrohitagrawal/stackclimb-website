/* Drives a throwaway git repo for tests/hook-binding-selftest.mjs. Split out
   of it under the D8 budget, same pattern as lib/baseline-guard-cases.mjs:
   this file knows HOW to make a fresh clone and attempt a commit, the
   self-test knows WHAT must be true. Nothing here asserts anything.

   Nothing in here touches this repo's own `.git`. The self-test attempts
   commits that are meant to fail, and a few that are meant to succeed; run
   against the real repo those successes would be junk commits, and the one
   already-bound laptop would pass a test the fix exists to prove. That is not
   a hypothetical: while building this, a hand-run probe of the hook against
   the real repo ended in `git reset --hard HEAD~1` and destroyed an hour of
   uncommitted work. The throwaway repo is the whole point.

   GIT_CONFIG_GLOBAL and GIT_CONFIG_SYSTEM point at /dev/null so a
   `core.hooksPath` in someone's ~/.gitconfig cannot make the fresh-clone arm
   report "unbound" when it is not.

   RED WHEN: this file has no assertions of its own; breaking it turns the
   self-test's checks red, which is the intended direction. */

import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const GIT_ENV = {
  ...process.env,
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_SYSTEM: '/dev/null',
  GIT_TERMINAL_PROMPT: '0',
};

const text = (r) => `${r.stdout || ''}${r.stderr || ''}`.trim();

export const git = (cwd, ...args) => {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: GIT_ENV });
  return { code: r.status, out: text(r) };
};

export const sh = (cwd, cmd) => {
  const r = spawnSync('sh', ['-c', cmd], { cwd, encoding: 'utf8', env: GIT_ENV });
  return { code: r.status, out: text(r) };
};

/* The planted number is assembled digit by digit at run time. Spelling it out
   in source would make `node tests/no-pii.mjs` — which scans tests/ — go red
   on this very file. Same construction as lib/self-test-fixtures.mjs. */
const d = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0].join('');
export const DIRTY = `contact: +91 ${d.slice(0, 5)} ${d.slice(5)}\n`;
export const CLEAN = 'ordinary prose, nothing sensitive here\n';

/* Copies the WORKING TREE's hook and test harness, not HEAD's, so the hook
   under test is the one on disk — a `git archive HEAD` build would quietly
   test the committed version while someone edits the file. The snapshot
   directory is skipped: 13 MB of PNGs the hook never reads. */
export function buildFreshClone(repo, root) {
  const clone = join(root, 'clone');
  mkdirSync(clone);
  for (const dir of ['.githooks', 'tests']) {
    cpSync(join(repo, dir), join(clone, dir), { recursive: true, filter: (src) => !src.endsWith('-snapshots') });
  }
  cpSync(join(repo, '.gitignore'), join(clone, '.gitignore'));
  mkdirSync(join(clone, 'assets/inbox'), { recursive: true });
  writeFileSync(join(clone, 'assets/inbox/.gitkeep'), '');
  git(clone, 'init', '-q', '-b', 'main');
  git(clone, 'config', 'user.name', 'hook binding self-test');
  git(clone, 'config', 'user.email', 'selftest@example.invalid');
  git(clone, 'config', 'commit.gpgsign', 'false');
  git(clone, 'add', '-A');
  git(clone, 'commit', '-q', '-m', 'baseline');
  return clone;
}

/* `staged` is not bookkeeping, it is the trap this harness already fell into.
   `.gitignore:81` ignores `assets/inbox/**`, so a plain `git add` stages
   nothing and `git commit` exits 1 with "nothing to commit" — the inbox check
   passed on an UNBOUND repo, certifying the wrong cause. `refused` therefore
   means the file reached the index AND the commit was rejected, which "git
   had nothing to do" cannot satisfy. Hence the unconditional `-f`.

   `git reset --hard` afterwards, so an attempt that SUCCEEDS leaves no commit
   behind and an attempt that fails leaves no half-staged index — including
   restoring `.githooks/pre-commit` when a check has overwritten it. It is
   confined to `cwd`, which is always the throwaway repo. */
export function attemptCommit(cwd, path, body) {
  const head = git(cwd, 'rev-parse', 'HEAD').out;
  const abs = join(cwd, path);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body);
  git(cwd, 'add', '-f', '--', path);
  const staged = git(cwd, 'diff', '--cached', '--name-only').out.split('\n').includes(path);
  const r = git(cwd, 'commit', '-q', '-m', `self-test: ${path}`);
  git(cwd, 'reset', '-q', '--hard', head);
  rmSync(abs, { force: true });
  return { ...r, staged, refused: staged && r.code !== 0 };
}

/* First line of a command's output, for the check detail column. */
export const firstLine = (s) => s.split('\n').filter(Boolean)[0] || '(no output)';
