import { MMKV } from 'react-native-mmkv';

export const defaultStorage = new MMKV();

export function getItem<T>(storage: MMKV = defaultStorage, key: string): T | null {
  const value = storage.getString(key);

  try {
    return value ? JSON.parse(value) || null : null;
  } catch (error) {
    // Handle the error here. Sentry, Crashlytics, etc.
    console.error('Error parsing JSON:', error);

    return null;
  }
}

export function setItem<T>(storage: MMKV = defaultStorage, key: string, value: T) {
  storage.set(key, JSON.stringify(value));
}

export function removeItem(storage: MMKV = defaultStorage, key: string) {
  storage.delete(key);
}

export function getStorageHelpers(storage: MMKV = defaultStorage) {
  return {
    getItem: <T>(key: string) => getItem<T>(storage, key),
    setItem: <T>(key: string, value: T) => setItem<T>(storage, key, value),
    removeItem: (key: string) => removeItem(storage, key),
  };
}
