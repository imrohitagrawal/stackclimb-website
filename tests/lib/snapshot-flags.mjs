/* What did the command line ask for? Split out of baseline-write-guard.mjs:
   that file answers "may this write happen", which is a different question, and
   one concern per file is D8's first rule. The split also brought the guard
   back under its 250-line ceiling without trimming a comment.

   Playwright writes the PNG baselines itself, so there is no call site of ours
   to guard. The config file is the seam: it is evaluated before any test runs
   and it can read the full command line. Verified by experiment, not assumed.

   The mode matters, and the SHORT ATTACHED FORM is where the first version of
   this leaked: `npx playwright test -uall` is accepted by Playwright and was
   not matched, so the guard said "no update requested" while the run rewrote
   every tracked snapshot. Found by a cross-model review and confirmed by
   running it. `none` is not a write request and is allowed through.

   `--update-snapshots none` written with a space is treated as a request even
   though it is a no-op. Refusing a no-op is the harmless direction, and
   guessing whether commander consumed the next token is not. */
const SHORT = '-u';
const LONG = '--update-snapshots';

export function snapshotUpdateRequest(argv) {
  for (const a of argv) {
    if (a === SHORT || a === LONG) return 'changed';
    if (a.startsWith(`${LONG}=`)) return a.slice(LONG.length + 1);
    if (a.startsWith(SHORT) && a.length > SHORT.length && !a.startsWith('--')) return a.slice(SHORT.length);
  }
  return null;
}

export const wantsSnapshotUpdate = (argv) => {
  const mode = snapshotUpdateRequest(argv);
  return mode !== null && mode !== 'none';
};

