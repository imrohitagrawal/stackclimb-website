import { defineConfig, devices } from '@playwright/test';
import { assertSnapshotUpdateAllowed, snapshotUpdateMode } from './tests/lib/baseline-write-guard.mjs';

// DEF-59. Playwright writes the PNG baselines itself, so there is no call site
// of ours to guard — but this config is evaluated before any test runs and it
// can read the whole command line. An explicit -u / --update-snapshots that
// would rewrite snapshots THIS platform has committed is refused here. A
// GitHub runner is exempt: gates.yml's workflow_dispatch regeneration is the
// only sanctioned way to refresh them, and it must never be blocked.
assertSnapshotUpdateAllowed({ argv: process.argv, platform: process.platform, env: process.env });

// Serves the real static build, not the dev server. The dev server renders
// differently and would let a build-only defect through.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // a flaky gate is a broken gate; surface it rather than paper over it
  // DEF-59, the half no command line reveals. Playwright's default is
  // 'missing': a bare run WRITES any snapshot that does not exist yet and
  // passes. Add a plate on Linux and a laptop-rendered -linux.png appears,
  // untracked, ready for the next `git add -A` — which is how 54 of them
  // landed once already (commit d25b0fc). 'none' turns that silent write into
  // a loud failure, and only where this platform already has committed
  // snapshots: a Mac's first run still seeds its own gitignored -darwin set,
  // and a runner keeps Playwright's default.
  updateSnapshots: snapshotUpdateMode({ platform: process.platform, env: process.env }),
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
  },
  webServer: {
    // DEF-11: the suite BUILDS before it tests. It used to run bare preview,
    // so breaking the source and skipping the rebuild left every gate green
    // against a stale dist/. reuseExistingServer is OFF for the same reason —
    // a preview left running from an earlier session is a stale server, and
    // silently reusing it is the same defect with a different clock. If this
    // errors with "port 4321 is used", kill that server; the loud failure is
    // the point.
    command: 'npm run build && npx astro preview --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: false,
    timeout: 120_000,
    // DEF-20 follow-up: Astro 7's `am-i-vibing` dependency detects an AI
    // coding agent (CLAUDECODE, CURSOR_TRACE_ID, REPL_ID, etc. — see
    // node_modules/astro/dist/cli/agent.js) and silently daemonizes `astro
    // preview`, returning immediately with the server backgrounded. Playwright's
    // webServer expects the command to stay in the foreground until it's killed;
    // a daemonized server breaks that contract even though the server itself
    // comes up fine. `ASTRO_PREVIEW_BACKGROUND` is the flag astro's own preview
    // command checks (node_modules/astro/dist/cli/preview/index.js:40) to skip
    // agent detection entirely — set here, not in npm run dev/preview, so only
    // test runs are affected.
    env: { ASTRO_PREVIEW_BACKGROUND: '1' },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
