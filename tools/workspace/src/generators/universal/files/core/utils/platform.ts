import { Platform } from 'react-native';

/**
 * Returns `true` if the current platform is iOS, `false` otherwise
 */
export const isIos = Platform.OS === 'ios';

/**
 * Returns `true` if the current platform is Android, `false` otherwise
 */
export const isAndroid = Platform.OS === 'android';

/**
 * Returns `true` if the current platform is Web, `false` otherwise
 */
export const isWeb = Platform.OS === 'web';
