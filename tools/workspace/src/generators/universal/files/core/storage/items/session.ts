import { MMKV } from 'react-native-mmkv';

import { getStorageHelpers } from '../helpers';
import { storageKeys } from '../keys';

export const SESSION_TOKEN_KEY = storageKeys.session.token;

const { getItem, setItem, removeItem } = getStorageHelpers(new MMKV({ id: storageKeys.session.id }));

export const getSessionToken = () => getItem<string>(SESSION_TOKEN_KEY);
export const setSessionToken = (token: string) => setItem(SESSION_TOKEN_KEY, token);
export const deleteSessionToken = () => removeItem(SESSION_TOKEN_KEY);

export const sessionTokenStorage = {
  get: getSessionToken,
  set: setSessionToken,
  delete: deleteSessionToken,
};
