import * as Localization from 'expo-localization';
import type { LanguageDetectorModule } from 'i18next';

import { config } from '../../constants/configs/expo';
import { appLocaleStorage } from '../../storage';

export const getSavedAppLocale = () => appLocaleStorage.get();
export const setSavedAppLocale = (locale: string) => appLocaleStorage.set(locale);

const detectPhonePrimaryLocale = () => {
  const primaryLocaleIndex = 0;
  const locales = Localization.getLocales();
  const primaryLocale = locales[primaryLocaleIndex];

  return primaryLocale?.languageTag;
};

const detectLanguageToUse = () => {
  const currentlySelectedLocale = getSavedAppLocale();

  if (currentlySelectedLocale) {
    // Analytics.setUserProperty('language', currentlySelectedLocale);

    return currentlySelectedLocale;
  }

  const phonePrimaryLocale = detectPhonePrimaryLocale();
  const selectedLanguage = phonePrimaryLocale ?? config.defaultLocale;

  // Analytics.setUserProperty('language', selectedLanguage);
  setSavedAppLocale(selectedLanguage);

  return selectedLanguage;
};

export const languageDetector: LanguageDetectorModule = {
  type: 'languageDetector',
  detect: detectLanguageToUse,
};
