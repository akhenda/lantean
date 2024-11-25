
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
export const eslintConfigFile = 'eslint.config.js';

/**
 * Filename of Prettier config.
 */
export const prettierConfigFile = '.prettierrc';

/**
 * Name and version of the workspace ESLint Config library dependencies.
 */
export const eslintLibDepVersions = {
  '@theunderscorer/nx-semantic-release': '^2.12.0',
  '@typescript-eslint/eslint-plugin': '^8.15.0',
  '@typescript-eslint/parser': '^8.15.0',
  eslint: '^8.57.0',
  'eslint-config-sheriff': '^25.1.0',
  'eslint-define-config': '^2.1.0',
  'eslint-plugin-prettier': '^5.2.1',
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

export const eslintIgnores = [
  '.eslintrc.js',
  '.eslintrc.cjs',
  'eslint.config.js',
  'eslint.config.cjs',
  'eslint.config.mjs',
  'eslint.config.mts',
  '.prettier.cjs',
  'coverage',
  '/coverage',
  '.npmrc',
  '.github',
  'package.json',
  'tsconfig.json',
  'jest.config.js',
  'jest.config.ts',
  'jest.config.cjs',
  'jest.config.mjs',
  'jest.config.mts',
];
