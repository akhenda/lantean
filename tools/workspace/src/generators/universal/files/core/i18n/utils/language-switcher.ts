import i18next from 'i18next';

import { setSavedAppLocale } from './language-detector';

import { Toaster } from '../../../design/__uiName__/components/toaster';

type SupportedLanguages = 'en' | 'fr';

export const changeLanguage = async (language: SupportedLanguages) => {
  await i18next.changeLanguage(language, (error, t) => {
    if (error) {
      Toaster.show({ text1: 'The language could not be changed' });

      return;
    }

    setSavedAppLocale(language);

    Toaster.show({ text1: 'The language has been changed' });
  });
};
