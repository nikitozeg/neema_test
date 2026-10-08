import 'dotenv/config';
import { defineConfig } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';
import type { TestOptions } from './steps/fixtures';

const bdd = (name: string, features: string) =>
  defineBddProject({ name, features, steps: 'steps/**/*.ts' });

export default defineConfig<TestOptions>({
  // all money tests use the same funded sender, so they run one by one
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: process.env.BASE_URL },
  projects: [
    { ...bdd('api', 'features/api/*.feature') },
    { ...bdd('android', 'features/mobile/*.feature'), use: { platform: 'android' } },
    { ...bdd('ios', 'features/mobile/*.feature'), use: { platform: 'ios' } },
  ],
});
