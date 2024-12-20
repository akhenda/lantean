import Constants from 'expo-constants';

import { isIos } from '../../utils/platform';

//@ts-expect-error // We know we're passing the correct environment variables to `extra` in `app.config.ts`
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const Env: typeof import('../../../env.js').ClientEnv =
  Constants.expoConfig?.extra ?? {};

const env = Env.APP_ENV;
const version = Env.VERSION;
const iosbuildNumber = Constants.expoConfig?.ios?.buildNumber ?? '';
const androidVersionCode = Constants.expoConfig?.android?.versionCode
  ? Constants.expoConfig.android.versionCode.toString()
  : '';
const runtimeVersion = Constants.expoConfig?.runtimeVersion;
const iosBundleIdentifier = Constants.expoConfig?.ios?.bundleIdentifier ?? '';
const androidPackageName = Constants.expoConfig?.android?.package ?? '';
const apiURL = Env.API_URL;
const flagsmithKey = Env.FLAGSMITH_KEY;
const oneSignalAppId = Env.ONE_SIGNAL_APP_ID;
const revenueCatAppleApiKey = Env.REVENUE_CAT_APPLE_API_KEY;
const revenueCatAndroidApiKey = Env.REVENUE_CAT_ANDROID_API_KEY;

export const config = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'sw'],

  // App config
  env,
  isDebug: env === 'development',
  version,
  buildNumber: isIos ? iosbuildNumber : androidVersionCode,
  runtimeVersion,
  bundleId: isIos ? iosBundleIdentifier : androidPackageName,
  apiURL,

  // SDKs
  flagsmithKey,
  oneSignalAppId,
  revenueCatAppleApiKey,
  revenueCatAndroidApiKey,
} as const;
