import { remote, type Browser } from 'webdriverio';
import type { Currency } from './api';
import { env } from './env';

export type Platform = 'android' | 'ios';

// Accessibility ids are a guess. They have to be aligned with the real app (or added by the app team).
const ui = {
  phone: '~login-phone',
  password: '~login-password',
  signIn: '~login-submit',
  n2n: '~n2n-entry',
  recipientSearch: '~recipient-search',
  recipientItem: '~recipient-item',
  amount: '~amount-input',
  currency: '~currency-selector',
  fee: '~fee-value',
};

export class AppSession {
  private driver?: Browser;

  constructor(private platform: Platform) {}

  async start() {
    this.driver = await remote({
      hostname: process.env.APPIUM_HOST ?? '127.0.0.1',
      port: Number(process.env.APPIUM_PORT ?? 4723),
      logLevel: 'warn',
      capabilities:
        this.platform === 'android'
          ? {
              platformName: 'Android',
              'appium:automationName': 'UiAutomator2',
              'appium:appPackage': env('ANDROID_APP_PACKAGE'),
              'appium:appActivity': env('ANDROID_APP_ACTIVITY'),
            }
          : {
              platformName: 'iOS',
              'appium:automationName': 'XCUITest',
              'appium:bundleId': env('IOS_BUNDLE_ID'),
            },
    });
  }

  async signIn(phone: string, password: string) {
    await this.tap(ui.phone, phone);
    await this.tap(ui.password, password);
    await this.tap(ui.signIn);
  }

  async openAmountScreen(recipientPhone: string) {
    await this.tap(ui.n2n);
    await this.tap(ui.recipientSearch, recipientPhone);
    await this.tap(ui.recipientItem);
  }

  async typeAmount(amount: number, currency: Currency) {
    await this.tap(ui.currency);
    await this.tap(`~currency-${currency}`);
    await this.tap(ui.amount, String(amount));
  }

  async feeText(): Promise<string> {
    return (await this.driver!.$(ui.fee)).getText();
  }

  async close() {
    await this.driver?.deleteSession();
  }

  private async tap(selector: string, text?: string) {
    const element = await this.driver!.$(selector);
    await element.waitForDisplayed({ timeout: 10_000 });
    if (text === undefined) await element.click();
    else await element.setValue(text);
  }
}
