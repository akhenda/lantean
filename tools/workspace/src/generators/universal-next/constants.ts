/**
 * Name of the UI library
 */
export const uiName = 'ui-kit';

/**
 * Name of the utils library
 */
export const libName = 'lib';

/**
 * Common tags for the app
 */
export const commonTags = ['universal', 'next'] as const;

/**
 * Final tags for the app
 */
export const libTags = [...commonTags, 'universal-next'] as const;

/**
 * Dependencies to be installed
 */
export const dependencies = {
  'patch-package': '^8.0.0',
} as const;

/**
 * Dev Dependencies to be installed
 */
export const devDependencies = {
  'prettier-plugin-tailwindcss': '^0.6.6',
} as const;

/**
 * VSCode extensions to be installed
 */
export const vscodeExtensions = [] as const;
