/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Filename of VSCode CSS settings.
 */
export const vscodeCSSSettingsFile = 'css_custom_data.json';

/**
 * Name of the workspace ESLint Config library.
 */
export const eslintLibName = 'eslint-config';

/**
 * Directory of the workspace ESLint Config library.
 */
export const eslintLibDirectory = 'configs';

/**
 * Tags of the workspace ESLint Config library.
 */
export const eslintLibTags = ['config', 'configs', 'eslint'];

/**
 * Filename of ESLint configuration.
 */
export const eslintConfigFile = 'eslint.config.mjs';

/**
 * Filename of Prettier config.
 */
export const prettierConfigFile = '.prettierrc';

/**
 * Name and version of the workspace ESLint Config library dependencies.
 */
export const eslintLibDepVersions = {
  '@theunderscorer/nx-semantic-release': '^2.12.0',
  eslint: '^8.57.0',
  'eslint-config-sheriff': '^14.2.0',
  'eslint-define-config': '^2.1.0',
  prettier: '^3.3.3',
} as const;

/**
 * List of VSCode extensions that should be installed.
 */
export const vscodeExtensions = [
  'nrwl.angular-console',
  'esbenp.prettier-vscode',
  'firsttris.vscode-jest-runner',
  'dbaeumer.vscode-eslint',
  'mikestead.dotenv',
  'eamodio.gitlens',
  'streetsidesoftware.code-spell-checker',
  'formulahendry.auto-close-tag',
  'formulahendry.auto-rename-tag',
  'dsznajder.es7-react-js-snippets',
  'bradlc.vscode-tailwindcss',
  'lokalise.i18n-ally',
  'wesbos.theme-cobalt2',
] as const;
