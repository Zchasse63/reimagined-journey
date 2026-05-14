import { defineConfig, devices } from '@playwright/test';

// PLAYWRIGHT_BASE_URL lets us point the suite at production / a preview
// deploy without spinning up the local dev server (which needs env vars we
// don't always have locally). Falls back to localhost:4321 + webServer when
// unset.
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4321';
const useExternalBaseURL = !!process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  // Only auto-start the dev server when targeting localhost. Skip it for
  // production / preview runs.
  ...(useExternalBaseURL
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          url: 'http://localhost:4321',
          reuseExistingServer: !process.env.CI,
          timeout: 120000,
        },
      }),
});
