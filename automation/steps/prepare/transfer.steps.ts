import { randomUUID } from 'node:crypto';
import type { DataTable } from 'playwright-bdd';
import type { Currency } from '../../support/api';
import { need } from '../../support/context';
import { recipient, type RecipientKind } from '../../support/users';
import { When } from '../fixtures';

// "*" in the comment column means a generated unique comment
When('the following transfer is prepared:', async ({ ctx }, table: DataTable) => {
  const row = table.hashes()[0];
  const kind = row.recipient as RecipientKind;
  ctx.transfer = {
    amount: Number(row.amount),
    currency: row.currency as Currency,
    recipient: kind,
    externalId: recipient(kind).phone,
    comment: row.comment === '*' ? `qa-${randomUUID()}` : row.comment,
  };
});

When('the balances are saved', async ({ ctx, db }) => {
  const sender = need(ctx.sender, 'sender');
  const { recipient: kind } = need(ctx.transfer, 'transfer');
  const recipientId = recipient(kind).id;
  ctx.balances = {
    sender: await db.balances(sender.id),
    recipient: recipientId ? await db.balances(recipientId) : undefined,
  };
});

When("the number of the sender's transactions and fees is saved", async ({ ctx, db }) => {
  ctx.counts = await db.counts(need(ctx.sender, 'sender').id);
});
