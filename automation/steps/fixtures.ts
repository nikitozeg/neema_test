import { test as base, createBdd } from 'playwright-bdd';
import { ApiClient } from '../support/api';
import type { ScenarioContext } from '../support/context';
import { Db } from '../support/db';
import { AppSession, type Platform } from '../support/mobile';

type Fixtures = {
  ctx: ScenarioContext;
  api: ApiClient;
  db: Db;
  app: AppSession;
};

export type TestOptions = { platform: Platform };

export const test = base.extend<Fixtures & TestOptions>({
  platform: ['android', { option: true }],

  ctx: async ({}, use) => {
    await use({});
  },

  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  db: async ({}, use) => {
    const db = new Db();
    await use(db);
    await db.close();
  },

  // the Appium session starts in a step, so API scenarios never touch it
  app: async ({ platform }, use) => {
    const app = new AppSession(platform);
    await use(app);
    await app.close();
  },
});

export const { Given, When, Then } = createBdd(test);
