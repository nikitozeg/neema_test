import type { ApiResult, Currency } from './api';
import type { Balances } from './db';
import type { RecipientKind, Sender } from './users';

export type Transfer = {
  amount: number;
  currency: Currency;
  recipient: RecipientKind;
  externalId: string;
  comment: string;
};

// What a scenario passes from step to step. A new one is created for every scenario.
export type ScenarioContext = {
  sender?: Sender;
  transfer?: Transfer;
  breakdown?: ApiResult;
  response?: ApiResult;
  balances?: { sender: Balances; recipient?: Balances };
  counts?: { transactions: number; fees: number };
};

export function need<T>(value: T | undefined, name: string): T {
  if (value === undefined) throw new Error(`"${name}" is not set, a step before this one is missing`);
  return value;
}
