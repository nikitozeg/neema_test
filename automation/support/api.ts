import type { APIRequestContext } from '@playwright/test';

export const CURRENCY_ID = { USD: 1, ILS: 4 } as const;
export type Currency = keyof typeof CURRENCY_ID;

export type ApiResult = { status: number; body: any };

export class ApiClient {
  private token = '';

  constructor(private request: APIRequestContext) {}

  async login(phoneNumber: string, password: string): Promise<ApiResult> {
    const result = await this.post('/login', { phoneNumber, password });
    if (result.status === 200) this.token = result.body.token;
    return result;
  }

  breakdown(amount: number, currency: Currency): Promise<ApiResult> {
    const currencyId = CURRENCY_ID[currency];
    if (!currencyId) throw new Error(`Unsupported currency: ${currency}`);
    return this.post('/n2n/breakdown', { amount, currencyId });
  }

  transfer(data: { amount: number; comment: string; externalId: string }): Promise<ApiResult> {
    const { amount, comment, externalId } = data;
    return this.post('/n2n/transfer', { amount, comment, contact: { externalId } });
  }

  private async post(path: string, data: object): Promise<ApiResult> {
    const response = await this.request.post(path, {
      data,
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    });
    const text = await response.text();
    let body: any = text;
    try {
      body = JSON.parse(text);
    } catch {
      // not JSON, keep the raw text
    }
    return { status: response.status(), body };
  }
}
