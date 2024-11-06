import type { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import RevenueCat from 'react-native-purchases';

import { config } from '../constants/configs/expo';
import { isIos } from '../utils/platform';
import { logger } from '../logger';

import type { EntitlementsType } from './types';

const API_KEY = isIos ? config.revenueCatAppleApiKey : config.revenueCatAndroidApiKey;

export const Purchase = {
  init() {
    RevenueCat.configure({ apiKey: API_KEY });
  },

  async setLogLevel(logLevel: LOG_LEVEL) {
    await RevenueCat.setLogLevel(logLevel);
  },

  async setUser(appUserID: string) {
    await RevenueCat.logIn(appUserID);
  },

  async setAttributes(attributes: Record<string, string | null>) {
    await RevenueCat.setAttributes(attributes);
  },

  async getUserInformations() {
    return await RevenueCat.getCustomerInfo();
  },
  async getOfferings() {
    const offerings = await RevenueCat.getOfferings();

    return offerings.current;
  },

  async restorePurchases() {
    await RevenueCat.restorePurchases();
  },

  async makePurchase({
    purchasedPackage,
    entitlement,
  }: {
    purchasedPackage: PurchasesPackage;
    entitlement: EntitlementsType;
  }) {
    try {
      const { customerInfo } = await RevenueCat.purchasePackage(purchasedPackage);

      if (customerInfo.entitlements.active[entitlement]) return { isPurchaseSuccessful: true };

      return { isPurchaseSuccessful: false };
    } catch (error) {
      logger.error({ error, message: 'Failed to purchase package' });

      return { isPurchaseSuccessful: false };
    }
  },
};
