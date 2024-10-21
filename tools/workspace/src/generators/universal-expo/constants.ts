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
export const commonTags = ['universal', 'expo'] as const;

/**
 * Final tags for the app
 */
export const libTags = [...commonTags, 'universal-expo'] as const;

/**
 * Dependencies to be installed
 */
export const dependencies = {} as const;

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