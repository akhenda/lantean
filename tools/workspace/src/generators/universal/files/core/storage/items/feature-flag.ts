import { MMKV } from 'react-native-mmkv';

import { getStorageHelpers } from '../helpers';
import { storageKeys } from '../keys';

export const FEATURE_FLAG_KEY = storageKeys.featureFlag.id;

const { getItem, setItem, removeItem } = getStorageHelpers(new MMKV({ id: storageKeys.featureFlag.id }));

export const getFeatureFlag = () => getItem<boolean>(FEATURE_FLAG_KEY);
export const setFeatureFlag = (featureFlag: string) => setItem(FEATURE_FLAG_KEY, featureFlag);
export const deleteFeatureFlag = () => removeItem(FEATURE_FLAG_KEY);

export const featureFlagStorage = {
  get: getFeatureFlag,
  set: setFeatureFlag,
  delete: deleteFeatureFlag,
};
