# N2N automation

Playwright (API) + Appium (mobile), TypeScript. Scenarios are Gherkin features, run by Playwright through `playwright-bdd`.

## Run

```bash
npm install
cp .env.example .env     # fill in the staging values
npm run test:api         # fees, transfer, recipient check (API + DB)
npm run test:android     # needs Appium 2 and an emulator
npm run test:ios         # needs Appium 2 and a simulator
```

## Layout

- `features/` - scenarios (`api/`, `mobile/`)
- `steps/` - `prepare` -> `execute` -> `validate`; `fixtures.ts` gives every step `ctx` (scenario state), `api`, `db` and `app`
- `support/` - API client, SQL queries, Appium screen helper, money helper

| Test | Feature | Covers |
|---|---|---|
| AT-1 | `api/fees.feature` | all fee boundaries |
| AT-2 | `api/transfer.feature` | T3, T6, T7: `751.25 ILS`, balances, `transactions`, `fees_table` |
| AT-3 | `api/recipient.feature` | R1-R3: pending, registered, unknown recipient |
| AT-4 | `mobile/amount-screen.feature` | M1, M2: fee on screen = fee from API |

## What the tests assume

The assignment has no response formats, so:

- `/login` returns `{ token }`, used as `Authorization: Bearer`
- `/n2n/breakdown` returns `{ fee }`; `/n2n/transfer` returns `{ transactionId, fee }` on `200` and any `4xx` on error
- the transfer currency comes from the last breakdown call (the request has no `currencyId`)
- `balances_table(user_id, currency_id, amount)` holds the balances
- `transactions.user_id = users.id` and `fees.transaction_id = transactions.id` (as text)
- accessibility ids in `support/mobile.ts` are a guess

The DB assumptions are in `support/db.ts`, the API ones in `support/api.ts`, so each is a one-place fix.

## Checked

The code type-checks (`npm run typecheck`) and every step in the features has a definition. The tests were not run on Neema staging or on a device, there was no access to a Neema backend or app build.

Tests share one funded sender, so they run with one worker.
