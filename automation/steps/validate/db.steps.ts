import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { CURRENCY_ID, type Currency } from '../../support/api';
import { need } from '../../support/context';
import { fromMinor, money, toMinor } from '../../support/money';
import { recipient } from '../../support/users';
import { Then } from '../fixtures';

// DB is checked with polling, the server may write the records a moment after the response

Then('the {word} balance changed by {float}', async ({ ctx, db }, party: string, delta: number) => {
  const transfer = need(ctx.transfer, 'transfer');
  const balances = need(ctx.balances, 'balances');
  const isSender = party === 'sender';
  const userId = isSender ? need(ctx.sender, 'sender').id : need(recipient(transfer.recipient).id, 'recipient id');
  const before = need(isSender ? balances.sender : balances.recipient, `${party} balances`);
  await expect
    .poll(
      async () => {
        const now = (await db.balances(userId))[transfer.currency];
        return fromMinor(toMinor(now) - toMinor(before[transfer.currency]));
      },
      { message: `${party} ${transfer.currency} balance change` },
    )
    .toBe(money(delta));
});

Then('the balances are not changed', async ({ ctx, db }) => {
  const sender = need(ctx.sender, 'sender');
  const balances = need(ctx.balances, 'balances');
  expect(await db.balances(sender.id), 'sender balances').toEqual(balances.sender);
  const recipientId = recipient(need(ctx.transfer, 'transfer').recipient).id;
  if (recipientId && balances.recipient) {
    expect(await db.balances(recipientId), 'recipient balances').toEqual(balances.recipient);
  }
});

Then('the transaction is saved:', async ({ ctx, db }, table: DataTable) => {
  const [expected] = table.hashes();
  const id = String(need(ctx.response, 'transfer response').body.transactionId);
  await expect
    .poll(
      async () => {
        const row = await db.transaction(id);
        return row && {
          user: row.user_id,
          amount: money(row.amount),
          currency: row.currency_id,
          type: row.transaction_type,
        };
      },
      { message: 'transaction record' },
    )
    .toEqual({
      user: need(ctx.sender, 'sender').id,
      amount: money(expected.amount),
      currency: CURRENCY_ID[expected.currency as Currency],
      type: Number(expected.type),
    });
});

Then('the fee is saved with amount {float}', async ({ ctx, db }, fee: number) => {
  const id = String(need(ctx.response, 'transfer response').body.transactionId);
  const { currency } = need(ctx.transfer, 'transfer');
  await expect
    .poll(
      async () => {
        const row = await db.fee(id);
        return row && { amount: money(row.amount), currency: row.currency_id };
      },
      { message: 'fee record' },
    )
    .toEqual({ amount: money(fee), currency: CURRENCY_ID[currency] });
});

Then('no transaction and no fee are saved', async ({ ctx, db }) => {
  const counts = need(ctx.counts, 'counts');
  expect(await db.counts(need(ctx.sender, 'sender').id), 'transactions and fees of the sender').toEqual(counts);
});
