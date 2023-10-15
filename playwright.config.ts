import { defineConfig, devices } from '@playwright/test';
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(__dirname, "./tests/test-utilities/test.env"),
});

if (
  process.env.SHOPIFY_API_KEY === undefined ||
  process.env.SHOPIFY_API_SECRET === undefined ||
  process.env.SHOPIFY_APP_URL === undefined||
  process.env.SCOPES === undefined
) {
  throw new Error("Test environment variables not set");
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Look for test files in the "./tests/e2e" directory, relative to this configuration file.
  testDir: './tests/e2e',

  // Each test is given 30 seconds.
  timeout: 30 * 1000,

  // Maximum time expect() should wait for the condition to be met.
  expect: {
		timeout: 5 * 1000,
	},

  // Run all tests in parallel.
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use. See https://playwright.dev/docs/test-reporters 
  reporter: [
    ['list'],
    // ['html', { outputFolder: './tests/e2e/reports' }],
  ],

  // Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions.
  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: 'http://127.0.0.1:3000',

    // Collect trace when retrying the failed test.
    trace: 'on-first-retry',
  },

  // Configure projects for major browsers.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  // Run your local dev server before starting the tests.
  webServer: [
    {
      command: 'npx remix build && npm run start',
      url: 'http://127.0.0.1:3000',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        "SHOPIFY_APP_URL": process.env.SHOPIFY_APP_URL,
        "SHOPIFY_API_KEY": process.env.SHOPIFY_API_KEY,
        "SHOPIFY_API_SECRET": process.env.SHOPIFY_API_SECRET,
        "SCOPES": process.env.SCOPES,
        "PORT": process.env.PORT || "3000",
      },
    },
  ],
  outputDir: "./tests/e2e/results",
});