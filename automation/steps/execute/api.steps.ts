import type { Currency } from '../../support/api';
import { need } from '../../support/context';
import { When } from '../fixtures';

When('breakdown is requested for {float} {word}', async ({ ctx, api }, amount: number, currency: string) => {
  ctx.breakdown = await api.breakdown(amount, currency as Currency);
});

When('breakdown is requested for the prepared transfer', async ({ ctx, api }) => {
  const transfer = need(ctx.transfer, 'transfer');
  ctx.breakdown = await api.breakdown(transfer.amount, transfer.currency);
});

When('the transfer is sent', async ({ ctx, api }) => {
  const { amount, comment, externalId } = need(ctx.transfer, 'transfer');
  ctx.response = await api.transfer({ amount, comment, externalId });
});
