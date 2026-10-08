import { expect } from '@playwright/test';
import { sender } from '../../support/users';
import { Given } from '../fixtures';

Given('the funded sender is logged in', async ({ ctx, api }) => {
  ctx.sender = sender();
  const login = await api.login(ctx.sender.phone, ctx.sender.password);
  expect(login.status, 'login status').toBe(200);
  expect(login.body.token, 'login token').toBeTruthy();
});
