# N2N Transfers — Test Description

## Scope

N2N transfer: one Neema user sends USD or ILS to another user by phone number.

Covered:

- API: `POST /n2n/breakdown`, `POST /n2n/transfer`, validation and recipient status
- DB: transaction, fee and balance changes
- mobile: Android/iOS amount screen and transfer errors

Not covered: deposits, withdrawals, salary, currencies other than USD/ILS, load testing.

## Fee rules

| Currency | Amount | Fee |
|---|---:|---:|
| ILS | 0–700 | free |
| ILS | 701–1000 | 0.4% |
| ILS | 1001+ | 1% |
| USD | 0–100 | free |
| USD | 101–1000 | 0.4% |
| USD | 1001+ | 1% |

Tests treat the percentage as applying to the full amount. Sender pays amount + fee; recipient receives the requested amount. Fee is rounded half up to 2 decimals: `751.25 ILS * 0.4% = 3.01`.

## Environment

- staging backend + staging DB
- Android emulator, iOS simulator
- API: Playwright / TypeScript; mobile: Appium
- test users: funded sender; low-balance sender (`USD 55.22`, `ILS 5.02`); approved, pending and registered recipients; unknown phone

## What's covered

Fee boundaries through `POST /n2n/breakdown`:

- ILS: `700 => 0.00`, `700.01 => 2.80`, `751.25 => 3.01`, `1000 => 4.00`, `1000.01 => 10.00`, `1001 => 10.01`
- USD: `100 => 0.00`, `100.01 => 0.40`, `1000 => 4.00`, `1000.01 => 10.00`, `1001 => 10.01`

Transfers through `POST /n2n/transfer`:

- **T1:** `10 USD` to approved user: sender `-10`, recipient `+10`, no fee
- **T2:** `20 ILS` when sender has `5.02 ILS`: if conversion is supported, remaining `14.98 ILS` comes from USD at the breakdown rate
- **T3:** `751.25 ILS`: fee `3.01`, sender pays `754.26`, recipient gets `751.25`
- **T4:** `250 USD`: fee `1.00`, sender pays `251.00`
- **T5:** balance is `1000 USD`, send `1000 USD`: reject; the `4.00` fee is not covered
- **T6:** breakdown fee and charged fee must match
- **T7:** transfer after selecting ILS, without `currencyId`: must use ILS

Recipient and input checks:

- **R1–R3:** `pending`, `registered`, unknown recipient: error, no DB writes, no balance change
- **R4:** own phone number: error
- **R5:** `0507...`, `+97250...`, `97250...`: same recipient if those formats are supported
- **V1–V3:** zero/negative, 3-decimal, text/null/missing amount: `400`, no balance change
- **V4–V5:** bad/missing token and wrong login password: `401`; no token on failed login
- **V6–V7:** duplicate/concurrent transfer: no double apply and balance never goes below zero

Mobile checks:

- **M1–M2:** `Free` for `10 USD` / `20 ILS`; `0.40`, `2.80`, `3.01` for the boundary values above
- **M3–M5:** fee recalculates after currency switch; Next disabled for empty/zero; input accepts one dot and two decimals
- **M6–M10:** failed recipient/balance, double tap, offline confirm, Hebrew with large font; no duplicate transfer and UI stays readable

## DB assertions

Successful transfer:

- correct `transactions` record: user, amount, currency, `type 3`
- correct `fees_table` record when fee is non-zero
- sender debit = recipient credit + fee
- converted transfer also has the expected rate and amounts on both sides

Failed transfer: no transaction or fee record, balances unchanged.

## Automation

- **AT-1:** all fee boundaries via `/n2n/breakdown`
- **AT-2:** `751.25 ILS`; response, balances, `transactions`, `fees_table` — covers T3/T6/T7
- **AT-3:** pending, registered and unknown recipients; `4xx` error plus no DB changes — covers R1–R3
- **AT-4:** compare fee shown on Android/iOS with API — covers M1/M2

## Spec gaps and how tests read them

- **fee threshold.** Requirements use `0–700` then `701–1000`, but values like `700.50` and `1000.50` are not defined. Tests currently put any amount above the free limit into the next tier; needs confirmation.
- **fee base.** Tests calculate the percentage from the full transfer amount, not just the part above the threshold.
- **currency selection.** Transfer request has no `currencyId`. T7 pins the expected behaviour: a transfer started in ILS must stay in ILS.
- **recipient errors.** Exact response code/message for `pending`, `registered` and unknown users is not specified. Tests assert the important part: no money and no DB changes.
- **DB linkage.** `transactions.id` is numeric, `fees.transaction_id` is text, and recipient linkage is unclear. DB checks need the confirmed join path.
- **balances.** The sample has no balance table. Tests assume `balances_table(user_id, currency_id, amount)`; needs confirmation.
- **zero fee row.** Not clear whether free transfers create a `fees_table` row with `0`. Tests only require a fee record when fee is non-zero.
