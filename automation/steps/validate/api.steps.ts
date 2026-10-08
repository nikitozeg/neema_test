import { expect } from '@playwright/test';
import { need } from '../../support/context';
import { money } from '../../support/money';
import { Then } from '../fixtures';

Then('the breakdown fee is {float}', async ({ ctx }, fee: number) => {
  const { status, body } = need(ctx.breakdown, 'breakdown');
  expect(status, 'breakdown status').toBe(200);
  expect(money(body.fee), 'breakdown fee').toBe(money(fee));
});

Then('the transfer is accepted', async ({ ctx }) => {
  const { status, body } = need(ctx.response, 'transfer response');
  expect(status, 'transfer status').toBe(200);
  expect(body.transactionId, 'transaction id').toBeTruthy();
});

Then('the transfer is rejected', async ({ ctx }) => {
  const { status, body } = need(ctx.response, 'transfer response');
  expect(status, 'transfer status').toBeGreaterThanOrEqual(400);
  expect(status, 'transfer status').toBeLessThan(500);
  expect(body.transactionId, 'transaction id').toBeUndefined();
});

Then('the charged fee is the same as in the breakdown', async ({ ctx }) => {
  const charged = need(ctx.response, 'transfer response').body.fee;
  const expected = need(ctx.breakdown, 'breakdown').body.fee;
  expect(money(charged), 'charged fee').toBe(money(expected));
});
