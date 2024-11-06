/**
 * Default name of the library.
 */
export const defaultLibName = 'logging';

/**
 * Default directory of the library.
 */
export const defaultLibDirectory = '';

/**
 * Default tags of the library.
 */
export const defaultLibTags = ['web', 'mobile', 'server', 'client', 'logging'];

/**
 * Dependencies of the library.
 */
export const deps = {
  '@neodx/log': '^0.4.1',
  '@rasri/log': '^1.3.0',
  'unilogr': '^0.0.27',
  'universal-logger-pro': '^1.2.1',
  'universal-logger': '^1.0.1',
  'universal-logger-browser': '^1.0.2',
} as const;
