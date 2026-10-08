import { expect } from '@playwright/test';
import { need } from '../../support/context';
import { money } from '../../support/money';
import { Then } from '../fixtures';

// a free transfer shows "Free", otherwise the screen shows the fee next to a currency symbol
Then('the fee on the screen is the same as in the breakdown', async ({ ctx, app }) => {
  const fee = money(need(ctx.breakdown, 'breakdown').body.fee);
  const shown = fee === '0.00' ? 'Free' : fee;
  await expect.poll(() => app.feeText(), { message: 'fee on the amount screen' }).toContain(shown);
});
