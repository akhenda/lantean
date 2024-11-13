/**
 * Default name of the library.
 */
export const defaultLibName = 'kv';

/**
 * Default directory of the library.
 */
export const defaultLibDirectory = '';

/**
 * Default tags of the library.
 */
export const defaultLibTags = ['server', 'kv'];

/**
 * Dependencies of the library.
 */
export const deps = {
  '@upstash/redis': '^1.34.3',
  '@upstash/ratelimit': '^2.0.4',
  'server-only': '^0.0.1',
} as const;
