/**
 * Default name of the library.
 */
export const defaultLibName = 'db';

/**
 * Default directory of the library.
 */
export const defaultLibDirectory = '';

/**
 * Default tags of the library.
 */
export const defaultLibTags = ['server', 'db'];

/**
 * Dependencies of the library.
 */
export const deps = {
  '@clerk/nextjs': '^6.3.2',
  '@clerk/themes': '^2.1.43',
  dotenv: '^16.4.5',
  'dotenv-expand': '^11.0.6',
  'drizzle-orm': '^0.36.1',
  'drizzle-zod': '^0.5.1',
  pg: '^8.13.1',
  postgres: '^3.4.5',
  ulid: '^2.3.0',
  zod: '^3.23.8',
} as const;

export const devDeps = {
  'cross-env': '^7.0.3',
  'drizzle-kit': '^0.28.0',
} as const;
