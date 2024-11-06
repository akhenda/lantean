import { OneSignal } from 'react-native-onesignal';

import { config } from '../constants/configs/expo';
import { logger } from '../logger';

export const Notifications = {
  init() {
    OneSignal.initialize(config.oneSignalAppId);

    this.watchForNotificationPress();
  },

  setUser(userId: string) {
    OneSignal.login(userId);
  },

  removeUser() {
    OneSignal.logout();
  },

  setUserEmail(email: string) {
    OneSignal.User.addEmail(email);
  },

  removeUserEmail(email: string) {
    OneSignal.User.removeEmail(email);
  },

  setUserLanguage(language: string) {
    OneSignal.User.setLanguage(language);
  },

  addTag(key: string, value: string) {
    OneSignal.User.addTag(key, value);
  },

  removeTag(key: string) {
    OneSignal.User.removeTag(key);
  },

  optOut() {
    OneSignal.User.pushSubscription.optOut();
  },

  optIn() {
    OneSignal.User.pushSubscription.optIn();
  },

  watchForNotificationPress() {
    OneSignal.Notifications.addEventListener('click', (event) => {
      logger.dev('OneSignal: notification clicked:', event);
    });
  }
}
