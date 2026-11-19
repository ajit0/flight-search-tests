// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.js',
  timeout: 90_000,
  expect: { timeout: 15_000 },

  // live public site - run one test at a time so we don't trigger the bot check
  workers: 1,
  retries: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
  ],

  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.BASE_URL || 'https://flights.booking.com',
    locale: 'en-GB',
    viewport: { width: 1366, height: 900 },
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
});
