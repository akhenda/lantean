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
export const eslintConfigFile = '.eslintrc.json';

/**
 * Filename of Prettier config.
 */
export const prettierConfigFile = '.prettierrc';

/**
 * Filename of Prettier config in json.
 */
export const prettierConfigJsonFile = '.prettierrc.json';

/**
 * Name of ESLint Prettier plugin.
 */
export const prettierPlugin = 'prettier';

/**
 * Prettier NPM Version.
 */
export const prettierVersion = '3.3.3';

/**
 * Name of ESLint Prettier NPM package.
 */
export const eslintPluginPrettier = 'eslint-plugin-prettier';

/**
 * Name and version of the workspace ESLint Config library dependencies.
 */
export const eslintLibDepVersions = {
  '@shopify/eslint-plugin': '^45.0.0',
  '@theunderscorer/nx-semantic-release': '^2.12.0',
  eslint: '^8.57.0',
  'eslint-config-prettier': '^9.1.0',
  'eslint-plugin-array-func': '^4.0.0',
  'eslint-plugin-boundaries': '^4.2.2',
  'eslint-plugin-cypress': '^3.5.0',
  'eslint-plugin-deprecate': '^0.8.5',
  'eslint-plugin-eslint-comments': '^3.2.0',
  'eslint-plugin-filenames': '^1.3.2',
  'eslint-plugin-functional': '^6.6.3',
  'eslint-plugin-html': '^8.1.1',
  'eslint-plugin-import': '^2.29.1',
  'eslint-plugin-jest': '^28.8.2',
  'eslint-plugin-jest-dom': '^5.4.0',
  'eslint-plugin-jest-formatting': '^3.1.0',
  'eslint-plugin-jsonc': '^2.16.0',
  'eslint-plugin-jsx': '^0.1.0',
  'eslint-plugin-jsx-a11y': '^6.9.0',
  'eslint-plugin-lodash': '^8.0.0',
  'eslint-plugin-n': '^17.10.2',
  'eslint-plugin-no-constructor-bind': '^2.0.4',
  'eslint-plugin-no-secrets': '^1.0.2',
  'eslint-plugin-no-unsanitized': '^4.0.2',
  'eslint-plugin-playwright': '^^0.15.3',
  'eslint-plugin-prettier': '^5.2.1',
  'eslint-plugin-promise': '^7.1.0',
  'eslint-plugin-react': '^7.35.0',
  'eslint-plugin-react-hooks': '^4.6.2',
  'eslint-plugin-security': '^3.0.1',
  'eslint-plugin-simple-import-sort': '^12.1.1',
  'eslint-plugin-sonarjs': '^2.0.2',
  'eslint-plugin-sort-class-members': '^1.20.0',
  'eslint-plugin-sort-keys-fix': '^1.1.2',
  'eslint-plugin-switch-case': '^3.0.1',
  'eslint-plugin-testing-library': '^6.3.0',
  'eslint-plugin-unicorn': '^55.0.0',
  'eslint-plugin-unused-imports': '^3.2.0',
  'eslint-plugin-write-good-comments': '^0.2.0',
  'eslint-plugin-yml': '^1.14.0',
  jest: '^29.7.0',
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
