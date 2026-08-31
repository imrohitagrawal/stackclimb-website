/* Reading and writing the DEF-54 geometry baseline. Split out of
   geometry.spec.js because it is a separate concern and because the spec hit
   252 lines against D8's 250 ceiling — the rule is modularize, never trim the
   comments (file-budget.mjs). The same split post-deploy-selftest.mjs made,
   for the same reason.

   PLATFORM-SCOPED, and this was MEASURED rather than assumed — the plan's
   acceptance item 6 doing exactly the job it was written for. The plan's
   premise was that "numbers do not vary by OS the way anti-aliasing does".
   That premise is REFUTED. A baseline generated on ubuntu-latest by CI run
   32738865852 was diffed against one generated on darwin at the same commit,
   with no source change between them: of 828 keys, 284 differed and 148 were
   PAST THE SLACK, the worst by 42px (`plate.quorum-record` at 390).

   The deltas land on plate HEIGHTS and link WIDTHS, which is the tell. macOS
   and Linux rasterize the same self-hosted font files to different advance
   widths, so text wraps at different points, so blocks are different heights.
   Geometry does not escape font rendering — it inherits it through the wrap
   point. Numbers are not OS-independent here, and now we know by how much.

   So the file carries its platform, exactly as the PNG baselines do. The linux
   file is the committed authority and the only one CI reads. A darwin file is
   gitignored and is a developer's local convenience; it is generated from
   whatever the page currently does, so it certifies nothing on its own. Never
   commit one.

   REGENERATE THE COMMITTED (linux) BASELINE: run gates.yml's
   `update_geometry_baseline` dispatch, download the artifact, commit it. Never
   hand-generate it on a laptop — a darwin run writes a DIFFERENT file that CI
   never reads, and the 42px measurement above is why. (This paragraph lived in
   geometry.spec.js's header until DEF-58 moved it here, where the writing is —
   and where "the 42px measurement above" is finally true. In the spec it
   pointed at a number that was never in that file.)
   A local baseline, for working on this gate, is
     UPDATE_GEOMETRY=1 npx playwright test tests/geometry.spec.js --workers=1
   On a Mac that writes the gitignored darwin file. On LINUX the same command
   used to write the committed authority, and the spec's comment used to claim
   otherwise — "and it is gitignored" was true on one platform and false on the
   one that matters. DEF-59. It is now refused rather than corrected in prose:
   baseline-write-guard.mjs asks git whether the target is tracked. To dump the
   numbers this page currently produces without touching the authority, name a
   file git is not tracking:
     GEOMETRY_BASELINE_OUT=tests/geometry-baseline.local.json
   That redirects the WRITE only. The spec's comparison always reads BASELINE,
   so on Linux there is no local loop — there is a scratch file to `diff`
   against the committed one. Said plainly because an earlier draft implied a
   loop that does not exist.
   --workers=1 is enforced, not requested: the spec throws without it, because
   parallel workers are separate processes and the last to write would drop the
   others' legs. */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { serialize } from './geometry-compare.mjs';
import { resolveGeometryTarget } from './baseline-write-guard.mjs';

/* fileURLToPath, not `new URL(...).pathname`. The latter leaves the path
   percent-encoded, so a checkout under a directory with a space in its name
   resolves to `/tmp/geo%20r2/...`, existsSync says false, and the gate fails
   with a path that does not exist on disk. It fails loud either way; this makes
   the message true. */
export const BASELINE = fileURLToPath(
  new URL(`../geometry-baseline.${process.platform}.json`, import.meta.url),
);

/* `!!process.env.X` is true for the STRING "0", so `UPDATE_GEOMETRY=0` would
   have silently rewritten the baseline. Found by a cross-model review. */
export const UPDATING = ['1', 'true', 'yes'].includes(
  (process.env.UPDATE_GEOMETRY ?? '').toLowerCase(),
);

/* A malformed baseline returns null rather than throwing. The spec reads it at
   module scope, so an uncaught parse error stops the FILE from loading — which
   means the regeneration command the failure message recommends cannot run
   until someone deletes the file by hand. Returning null keeps that recovery
   path open while still failing: the "real baseline" test asserts not-null, so
   a corrupt file can never be mistaken for a clean one. */
export function readBaseline(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

/* Every leg the CONFIG defines, not every leg this run happened to visit.
   `testInfo.config.projects` holds all configured projects even under
   `--project=` or `--grep`, so a filtered run still prunes against the whole
   matrix instead of deleting the legs it did not measure. */
export const expectedLegs = (projects, widths, routes, legKey) =>
  new Set(projects.flatMap((p) => widths.flatMap((w) => routes.map((r) => legKey(p.name, w, r)))));

/* Playwright starts a FRESH worker process when the project changes, so the
   spec's accumulator is empty again at the top of the second project and a
   plain overwrite drops the first project's legs entirely. Measured: the first
   generated file held only the mobile legs, and 23 of 44 tests then failed with
   "measured but NOT in the baseline".

   So: merge whole legs onto whatever is on disk, then prune every leg outside
   the configured matrix. Merging alone leaves a stale leg behind when a route
   or width is removed; pruning drops it, whatever order the workers ran in.
   A whole leg is replaced rather than merged
   key-by-key, so a deleted plate's key cannot survive inside a leg that was
   re-measured.

   Pruning removes legs the matrix does not define. It does NOT prove every leg
   the matrix DOES define is present — a `--grep`ped update writes only what it
   measured. Completeness is the spec's job: the "real baseline" test asserts the
   leg count equals widths x routes x configured projects. Said plainly here
   because an earlier version of this comment claimed pruning made the file
   "exactly the matrix", which is half the truth. */
export function writeBaseline(path, collected, expected) {
  /* DEF-59, and the first thing that happens: decide WHERE this may land
     before reading or writing anything. On a GitHub runner that is `path`. On
     a laptop it is `path` only while git is not tracking it — otherwise the
     run would replace the committed authority with whatever the page does
     right now, and the sentence three paragraphs up ("Never commit one") was
     the only thing stopping it. It reads as harmless too: geometry.spec.js
     skips every comparison while UPDATE_GEOMETRY is set, so the developer sees
     a clean run that has just overwritten the gate.

     GEOMETRY_BASELINE_OUT names a gitignored file for anyone who wants the
     local loop anyway; `tests/geometry-baseline.local.json` is already covered
     by .gitignore's own glob. The merge below reads and writes that SAME
     resolved target, so a redirected run accumulates its own legs instead of
     seeding itself from the committed file and quietly diverging. */
  const target = resolveGeometryTarget({ path, env: process.env });
  const onDisk = readBaseline(target) ?? {};
  const merged = { ...onDisk, ...collected };
  for (const leg of Object.keys(merged)) if (!expected.has(leg)) delete merged[leg];
  writeFileSync(target, serialize(merged));
}
