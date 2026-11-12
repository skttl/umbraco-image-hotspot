import { test as setup } from '@playwright/test';
import { STORAGE_STATE } from '../../playwright.config.js';
import { ApiHelpers } from '@umbraco-cms/acceptance-test-helpers';
import { createFixtures } from './fixtures.js';

setup('authenticate with a backoffice cookie and prepare fixtures', async ({ page }) => {
  setup.setTimeout(90_000);
  const login = process.env.UMBRACO_USER_LOGIN;
  const password = process.env.UMBRACO_USER_PASSWORD;
  if (!login || !password) {
    throw new Error('Set UMBRACO_USER_LOGIN and UMBRACO_USER_PASSWORD for the local demo admin.');
  }
  const api = new ApiHelpers(page);
  await api.signIn(login, password);
  await createFixtures(api);
  await page.context().storageState({ path: STORAGE_STATE });
});
