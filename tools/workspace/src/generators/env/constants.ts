/**
 * Default name of the library.
 */
export const defaultLibName = 'env';

/**
 * Default directory of the library.
 */
export const defaultLibDirectory = 'configs';

/**
 * Default tags of the library.
 */
export const defaultLibTags = [
  'config',
  'configs',
  'constants',
  'web',
  'mobile',
  'server',
  'universal',
  'client',
];

/**
 * Dependencies of the library.
 */
export const envDeps = {
  '@t3-oss/env-core': '^0.11.1',
  zod: '^3.23.8',
} as const;
