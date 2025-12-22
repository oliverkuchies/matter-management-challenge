import { defineConfig } from '@playwright/test';

/**
 * Playwright configuration for API testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/api',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },

  // No browser projects needed for API tests
  projects: [
    {
      name: 'api',
      use: {
        baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
      },
    },
  ],

  // Optionally start the backend server for testing
  // Comment this out if you're running the backend separately
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
