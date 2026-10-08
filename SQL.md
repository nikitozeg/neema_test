# N2N SQL checks

Run on the staging DB after the tests. PostgreSQL syntax, amounts are `NUMERIC`. `transactions.id` is numeric and `fees.transaction_id` is text, so the join casts the id (see "DB linkage" in `TESTS.md`). Currency ids: `1` USD, `4` ILS. Transaction type `3` is P2P.

## 1. One transfer: transaction and fee

AT-2 uses the `transactionId` from the `/n2n/transfer` response.

```sql
SELECT t.id,
       t.user_id,
       t.amount,
       t.currency_id,
       tt.description AS type,
       f.amount       AS fee
FROM transactions_table t
JOIN transaction_types_table tt ON tt.id = t.transaction_type
LEFT JOIN fees_table f ON f.transaction_id = CAST(t.id AS VARCHAR(50))
WHERE t.id = :transaction_id;
```

Expected for `751.25 ILS`: one row, `user_id` is the sender, `amount` `751.25`, `currency_id` `4`, `type` `P2P`, `fee` `3.01`. With BUG-1 the `fee` is `3.00`. For a free transfer `fee` is `NULL` (or `0` if the server writes a zero row, see "zero fee row" in `TESTS.md`).

## 2. All transfers: fee follows the pricing rule

Returns only the wrong transfers, so an empty result means every fee is correct.

```sql
WITH expected AS (
    SELECT t.id,
           t.user_id,
           t.currency_id,
           t.amount,
           CASE
               -- free up to 700 ILS / 100 USD
               WHEN t.amount <= CASE t.currency_id WHEN 4 THEN 700 ELSE 100 END THEN 0
               -- 0.4% up to 1000
               WHEN t.amount <= 1000 THEN ROUND(t.amount * 0.004, 2)
               -- 1% above 1000
               ELSE ROUND(t.amount * 0.01, 2)
           END AS expected_fee
    FROM transactions_table t
    WHERE t.transaction_type = 3      -- P2P
      AND t.currency_id IN (1, 4)     -- USD, ILS
)
SELECT e.id,
       e.user_id,
       e.currency_id,
       e.amount,
       COALESCE(f.amount, 0) AS charged_fee,
       e.expected_fee
FROM expected e
LEFT JOIN fees_table f ON f.transaction_id = CAST(e.id AS VARCHAR(50))
WHERE COALESCE(f.amount, 0) <> e.expected_fee
ORDER BY e.id;
```

With BUG-1 it returns the `751.25 ILS` transfer: `charged_fee` `3.00`, `expected_fee` `3.01`. A transfer that should pay a fee but has no `fees_table` row shows `charged_fee` `0`.
