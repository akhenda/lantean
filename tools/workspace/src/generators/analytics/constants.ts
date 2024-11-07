/**
 * Default name of the library.
 */
export const defaultLibName = 'analytics';

/**
 * Default directory of the library.
 */
export const defaultLibDirectory = '';

/**
 * Default tags of the library.
 */
export const defaultLibTags = ['web', 'mobile', 'server', 'client', 'analytics'];

/**
 * Dependencies of the library.
 */
export const deps = {
  'expo-application': '^5.9.1',
  'expo-device': '^6.0.2',
  'expo-file-system': '^17.0.1',
  'expo-localization': '^15.0.3',
  'posthog-js': '^1.181.0',
  'posthog-node': '^4.2.1',
  'posthog-react-native': '^3.3.10',
} as const;
