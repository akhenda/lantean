/**
 * Default name of the library.
 */
export const defaultLibName = 'backend';

/**
 * Default directory of the library.
 */
export const defaultLibDirectory = '';

/**
 * Default tags of the library.
 */
export const defaultLibTags = ['server', 'backend', 'type:convex', 'domain:server'];

/**
 * Dependencies of the library.
 */
export const deps = {
  '@edge-runtime/vm': '^4.0.4',
  convex: '^1.17.0',
  'convex-test': '^0.0.34',
} as const;

export const devDeps = {} as const;
