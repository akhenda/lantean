import noop from 'lodash/noop';
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import type { StartUpdateOptions } from 'sp-react-native-in-app-updates';
import SpInAppUpdates, { IAUUpdateKind } from 'sp-react-native-in-app-updates';

import logger from '@lantean/logger';
import { sleep } from '@lantean/universal/utils/sleep';

import { isAndroid } from './platform';

import { config } from '../configs/expo';

/**
 * Checks if there is an available Expo OTA update and if so, fetches and loads
 * it. If an error occurs while fetching or loading the update, it will be logged
 * as a warning.
 *
 * @returns {Promise<void>}
 */
export const checkForOtaUpdate = async () => {
  try {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      const ONE_SECOND = 1_000;

      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
      await sleep(ONE_SECOND);
    }
  } catch (error) {
    logger.error({
      error,
      level: 'warning',
      message: 'Error fetching latest Expo update',
    });
  }
};

/**
 * Checks if there is an available native update and if so, returns an object
 * with shouldUpdate=true, startUpdate=async function, storeVersion=string, and
 * currentVersion=string. If an error occurs while checking for an update, it
 * will be logged as a warning.
 *
 * @param optionsOverwrites The options to overwrite the default behavior.
 * @returns
 *   {
 *     shouldUpdate: boolean;
 *     startUpdate: () => Promise<void>;
 *     storeVersion: string;
 *     currentVersion: string;
 *   }
 */
export const checkForNativeUpdate = async (
  optionsOverwrites: StartUpdateOptions,
) => {
  let options: StartUpdateOptions = {};

  const inAppUpdates = new SpInAppUpdates(config.isDebug);
  const currentVersion = Application.nativeApplicationVersion;
  const { shouldUpdate, storeVersion } = await inAppUpdates.checkNeedsUpdate();

  if (shouldUpdate) {
    if (isAndroid) {
      options = { ...optionsOverwrites, updateType: IAUUpdateKind.FLEXIBLE };
    } else {
      options = optionsOverwrites;
    }

    return {
      shouldUpdate,
      startUpdate: async () => inAppUpdates.startUpdate(options),
      storeVersion,
      currentVersion,
    };
  }

  return {
    shouldUpdate: false,
    startUpdate: noop,
    storeVersion,
    currentVersion,
  };
};
