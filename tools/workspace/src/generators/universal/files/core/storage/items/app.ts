import { MMKV } from 'react-native-mmkv';

import { getStorageHelpers } from '../helpers';
import { storageKeys } from '../keys';

export const APP_LOCALE_KEY = storageKeys.app.locale;

const { getItem, setItem, removeItem } = getStorageHelpers(new MMKV({ id: storageKeys.app.id }));

export const getAppLocale = () => getItem<string>(APP_LOCALE_KEY);
export const setAppLocale = (locale: string) => setItem(APP_LOCALE_KEY, locale);
export const deleteAppLocale = () => removeItem(APP_LOCALE_KEY);

export const appLocaleStorage = {
  get: getAppLocale,
  set: setAppLocale,
  delete: deleteAppLocale,
};
