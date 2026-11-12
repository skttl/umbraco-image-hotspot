import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const STORAGE_STATE = join(__dirname, 'tests/e2e/.auth/user.json');

process.env.STORAGE_STATE_PATH = STORAGE_STATE;

// @umbraco-cms/acceptance-test-helpers reads process.env.URL (not UMBRACO_URL) for its base URL
process.env.URL = process.env.UMBRACO_URL ?? 'https://localhost:5218';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['line'], ['junit', { outputFile: 'test-results/e2e.xml' }]],
  use: {
    baseURL: process.env.URL,
    trace: 'retain-on-failure',
    ignoreHTTPSErrors: true,
    testIdAttribute: 'data-mark',
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
    },
    {
      name: 'e2e',
      testMatch: '**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        ignoreHTTPSErrors: true,
        storageState: STORAGE_STATE,
      },
    },
  ],
});
