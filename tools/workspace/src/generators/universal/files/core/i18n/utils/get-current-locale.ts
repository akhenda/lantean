import type { i18n } from 'i18next';

import { config } from '../../constants/configs/expo';

export const getCurrentLocale = (i18n: i18n) => {
  const languageCode = i18n.language;
  const [primaryCode] = languageCode.split('-');

  if (i18n.hasResourceBundle(languageCode, 'app')) return languageCode;
  else if (primaryCode && i18n.hasResourceBundle(primaryCode, 'app')) return primaryCode;

  return config.defaultLocale;
};
