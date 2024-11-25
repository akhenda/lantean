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
 * Name of ESLint Prettier plugin.
 */
export const prettierPlugin = 'prettier';

/**
 * Prettier NPM Version.
 */
export const prettierVersion = '^3.3.3';

/**
 * Name of ESLint Prettier NPM package.
 */
export const eslintPluginPrettier = 'eslint-plugin-prettier';

/**
 * Name and version of the workspace ESLint Config library dependencies.
 */
export const eslintLibDepVersions = {
  '@babel/eslint-parser': '^7.25.9',
  '@babel/eslint-plugin': '^7.25.9',
  '@eslint/js': '^9.15.0',
  '@shopify/eslint-plugin': '^46.0.0',
  '@theunderscorer/nx-semantic-release': '^2.12.0',
  '@typescript-eslint/eslint-plugin': '^8.15.0',
  '@typescript-eslint/parser': '^8.15.0',
  eslint: '^9.15.0',
  'eslint-config-prettier': '^9.1.0',
  'eslint-plugin-array-func': '^5.0.2',
  'eslint-plugin-boundaries': '^5.0.1',
  'eslint-plugin-cypress': '^4.1.0',
  'eslint-plugin-deprecate': '^0.8.5',
  'eslint-plugin-eslint-comments': '^3.2.0',
  'eslint-plugin-filenames': '^1.3.2',
  'eslint-plugin-functional': '^7.1.0',
  'eslint-plugin-html': '^8.1.2',
  'eslint-plugin-import': '^2.31.0',
  'eslint-plugin-jest': '^28.9.0',
  'eslint-plugin-jest-dom': '^5.5.0',
  'eslint-plugin-jest-formatting': '^3.1.0',
  'eslint-plugin-jsonc': '^2.18.2',
  'eslint-plugin-jsx': '^0.1.0',
  'eslint-plugin-jsx-a11y': '^6.10.2',
  'eslint-plugin-lodash': '^8.0.0',
  'eslint-plugin-n': '^17.14.0',
  'eslint-plugin-no-constructor-bind': '^2.0.4',
  'eslint-plugin-no-secrets': '^1.1.2',
  'eslint-plugin-no-unsanitized': '^4.1.2',
  'eslint-plugin-node': '^11.1.0',
  'eslint-plugin-playwright': '^2.1.0',
  'eslint-plugin-prettier': '^5.2.1',
  'eslint-plugin-promise': '^7.1.0',
  'eslint-plugin-react': '^7.37.2',
  'eslint-plugin-react-hooks': '^5.0.0',
  'eslint-plugin-security': '^3.0.1',
  'eslint-plugin-simple-import-sort': '^12.1.1',
  'eslint-plugin-sonarjs': '^2.0.4',
  'eslint-plugin-sort-class-members': '^1.21.0',
  'eslint-plugin-sort-keys-fix': '^1.1.2',
  'eslint-plugin-switch-case': '^3.0.1',
  'eslint-plugin-testing-library': '^7.0.0',
  'eslint-plugin-unicorn': '^56.0.1',
  'eslint-plugin-unused-imports': '^4.1.4',
  'eslint-plugin-write-good-comments': '^0.2.0',
  'eslint-plugin-yml': '^1.15.0',
  globals: '^15.12.0',
  jest: '^29.7.0',
  prettier: prettierVersion,
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
