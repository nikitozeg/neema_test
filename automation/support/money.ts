// Money is compared as exact "0.00" strings, so 3.01 never becomes 3.0100000000000002
// and a failed check reads "Expected: 3.01, Received: 3.00".
export const toMinor = (value: number | string): number => Math.round(Number(value) * 100);
export const fromMinor = (minor: number): string => (minor / 100).toFixed(2);
export const money = (value: number | string): string => fromMinor(toMinor(value));
