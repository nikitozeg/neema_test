import type { Currency } from '../../support/api';
import { need } from '../../support/context';
import { recipient } from '../../support/users';
import { When } from '../fixtures';

When('the sender is signed in to the app', async ({ ctx, app }) => {
  const sender = need(ctx.sender, 'sender');
  await app.start();
  await app.signIn(sender.phone, sender.password);
});

When('the N2N amount screen is open for the approved recipient', async ({ app }) => {
  await app.openAmountScreen(recipient('approved').phone);
});

When('{float} {word} is typed on the amount screen', async ({ app }, amount: number, currency: string) => {
  await app.typeAmount(amount, currency as Currency);
});
