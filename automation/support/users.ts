import { env } from './env';

export type RecipientKind = 'approved' | 'pending' | 'registered' | 'unknown';

export type Sender = { id: string; phone: string; password: string };
export type Recipient = { id?: string; phone: string };

export const sender = (): Sender => ({
  id: env('SENDER_ID'),
  phone: env('SENDER_PHONE'),
  password: env('SENDER_PASSWORD'),
});

// The id is optional: an unknown phone has no user in the DB
export const recipient = (kind: RecipientKind): Recipient => {
  const key = kind.toUpperCase();
  return { id: process.env[`RECIPIENT_${key}_ID`], phone: env(`RECIPIENT_${key}_PHONE`) };
};
