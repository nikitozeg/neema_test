import pg from 'pg';
import { CURRENCY_ID, type Currency } from './api';
import { env } from './env';
import { money } from './money';

export type Balances = Record<Currency, string>;

// Queries the tables from the assignment plus balances_table(user_id, currency_id, amount),
// which is not in the sample. All join assumptions live here, so they change in one place.
export class Db {
  private pool = new pg.Pool({ connectionString: env('DATABASE_URL'), max: 2 });

  async balances(userId: string): Promise<Balances> {
    const { rows } = await this.pool.query(
      'SELECT currency_id, amount FROM balances_table WHERE user_id = $1',
      [userId],
    );
    const amountOf = (currency: Currency) => {
      const row = rows.find((r) => r.currency_id === CURRENCY_ID[currency]);
      return money(row ? row.amount : 0);
    };
    return { USD: amountOf('USD'), ILS: amountOf('ILS') };
  }

  async transaction(id: string) {
    const { rows } = await this.pool.query(
      'SELECT user_id, amount, currency_id, transaction_type FROM transactions_table WHERE id = $1',
      [id],
    );
    return rows[0];
  }

  // transactions.id is numeric and fees.transaction_id is text, so they are compared as text
  async fee(transactionId: string) {
    const { rows } = await this.pool.query(
      'SELECT amount, currency_id FROM fees_table WHERE transaction_id = $1',
      [String(transactionId)],
    );
    return rows[0];
  }

  async counts(userId: string) {
    const transactions = await this.pool.query(
      'SELECT COUNT(*)::int AS n FROM transactions_table WHERE user_id = $1',
      [userId],
    );
    const fees = await this.pool.query(
      `SELECT COUNT(*)::int AS n FROM fees_table f
       JOIN transactions_table t ON f.transaction_id = t.id::text
       WHERE t.user_id = $1`,
      [userId],
    );
    return { transactions: transactions.rows[0].n as number, fees: fees.rows[0].n as number };
  }

  close() {
    return this.pool.end();
  }
}
