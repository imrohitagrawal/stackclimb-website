import { defineConfig, devices } from '@playwright/test';

// Serves the real static build, not the dev server. The dev server renders
// differently and would let a build-only defect through.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // a flaky gate is a broken gate; surface it rather than paper over it
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
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
