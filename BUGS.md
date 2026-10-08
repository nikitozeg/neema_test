# N2N Bugs

Two bugs from failed runs of the automated tests: server (AT-1, AT-2) and client (AT-4).

## BUG-1 (server): fee for `751.25 ILS` is `3.00`, should be `3.01`

- **Severity:** high. The customer is charged a wrong amount and the pricing rule is broken.
- **Component:** N2N pricing, `POST /n2n/breakdown` and `POST /n2n/transfer`
- **Found by:** AT-1 (row `ILS 751.25`) and AT-2
- **Environment:** staging backend + staging DB

Steps:

1. `POST /login` as the funded sender.
2. `POST /n2n/breakdown` with `{"amount": 751.25, "currencyId": 4}`.
3. `POST /n2n/transfer` with `{"amount": 751.25, "comment": "Gift", "contact": {"externalId": "<approved recipient>"}}`.
4. Check `fees_table` and the sender balance.

Expected: fee `3.01` (`751.25 * 0.4% = 3.005`, rounded half up). Sender pays `754.26`.

Actual: breakdown returns fee `3.00`, `fees_table.amount` is `3.00`, sender pays `754.25`.

Test output:

```
Breakdown - fee for 751.25 ILS is 3.01
  Then the breakdown fee is 3.01
  Error: breakdown fee
  Expected: "3.01"
  Received: "3.00"
```

AT-2 fails on the same step. The other 10 rows of AT-1 pass.

Suspected cause: the fee is rounded half to even (or cut off) instead of half up, so `3.005` becomes `3.00`.

Also check: every amount where the fee ends exactly on half a cent should be affected. AT-1 does not cover them yet, for example `251.25 USD` (`1.005`, should be `1.01`).

## BUG-2 (client): amount screen shows `Free` for `100.01 USD`, the fee is `0.40`

- **Severity:** high. The screen says there is no fee, then the user is charged.
- **Component:** mobile app, N2N "Enter amount" screen
- **Found by:** AT-4 (row `USD 100.01`), Android and iOS
- **Environment:** Android emulator, iOS simulator, staging backend

Steps:

1. Log in, open N2N and choose an approved recipient.
2. Select `USD` as the currency.
3. Type `100.01` in "You send".
4. Look at the "Fee" line.

Expected: `0.40`, the same as `/n2n/breakdown` returns.

Actual: "Fee" shows `Free` with the gift icon. The API returns `0.40` for the same amount.

Test output:

```
Amount screen - fee for 100.01 USD is the same as in the API
  Then the fee on the screen is the same as in the breakdown
  Error: fee on the amount screen
  Expected substring: "0.40"
  Received string:    "Free"
```

The other rows pass (`10 USD`, `20 ILS`, `700.01 ILS`, `751.25 ILS`).

Suspected cause: the app rounds the fee to a whole number before deciding to show `Free`, so `0.40` becomes `0`.

Also check: USD amounts from `100.01` up to about `250` have a fee below `1.00` and should show the same problem.
