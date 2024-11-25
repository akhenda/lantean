/**
 * ESLint recommended Flat Config.
 */
export function getESLintFlatConfig(globalsRef = 'globals') {
  return [
    '{',
    '/**',
    '* Eslint recommended config',
    '*/',
    `PLUGIN_IMPORT_REF.configs.recommended,`,
    '{',
    'languageOptions: {',
    `${globalsRef}: {`,
    `...${globalsRef}.es2021,`,
    `...${globalsRef}.browser,`,
    `...${globalsRef}.node,`,
    '},',
    '},',
    '}',
  ].join('\n\t');
}

/**
 * ESLint SonarJS Flat Config.
 */
export function getSonarJSFlatConfig() {
  return [
    '{',
    '/**',
    '* eslint-plugin-sonarjs',
    '*/',
    `PLUGIN_IMPORT_REF.configs.recommended,`,
    '{',
    'rules: {},',
    '}',
  ].join('\n\t');
}

export function getUnusedImportsFlatConfig(name = 'unused-imports') {
  return [
    '{',
    `plugins: { '${name}': PLUGIN_IMPORT_REF },`,
    'rules: {',
    "'no-unused-vars': 'off', // or '@typescript-eslint/no-unused-vars': 'off',",
    "'unused-imports/no-unused-imports': 'error',",
    "'unused-imports/no-unused-vars': [",
    "'warn',",
    '{',
    "vars: 'all',",
    "varsIgnorePattern: '^_',",
    "args: 'after-used',",
    "argsIgnorePattern: '^_',",
    '},',
    '],',
    '},',
    '},',
  ].join('\n\t');
}

export function getTypescriptFlatConfig(name = '@typescript-eslint', parser = 'typescriptEslintParser') {
  return [
    `PLUGIN_IMPORT_REF.configs.recommended`,
    '{',
    " files: ['**/*.ts', '**/*.tsx'],",
    'plugins: {',
    `'${name}': PLUGIN_IMPORT_REF,`,
    '},',
    'languageOptions: {',
    `parser: ${parser},`,
    'parserOptions: {',
    'ecmaVersion: 2021,',
    "sourceType: 'module',",
    '},',
    '},',
    'rules: {',
    "'@typescript-eslint/explicit-member-accessibility': ['warn', { accessibility: 'no-public' }],",
    "'@typescript-eslint/no-explicit-any': 'off',",
    "'@typescript-eslint/explicit-module-boundary-types': 'off',",
    "'@typescript-eslint/ban-types': 'off',",
    '"@typescript-eslint/no-deprecated": "error"',
    '},',
    '},',
  ].join('\n\t');
}

export function getImportOrderFlatConfig(name = 'import') {
  return [
    `PLUGIN_IMPORT_REF.flatConfigs.recommended,`,
    `PLUGIN_IMPORT_REF.flatConfigs.typescript,`,
    '{',
    "files: ['**/*.ts', '**/*.tsx'],",
    `plugins: { '${name}': PLUGIN_IMPORT_REF },`,
    'rules: {',
    "'import/order': [",
    "'error',",
    '{',
    "pathGroups: [{ pattern: '@nx-*/**', group: 'internal', position: 'before' }],",
    "groups: ['builtin', 'external', 'internal', 'parent', ['sibling', 'index']],",
    'pathGroupsExcludedImportTypes: [],',
    "'newlines-between': 'always',",
    "alphabetize: { order: 'asc', caseInsensitive: true },",
    '},',
    '],',
    "'import/no-unresolved': ['off'],",
    '},',
    'settings: {',
    "'import/resolver': {",
    "node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },",
    'typescript: {},',
    '},',
    '},',
    '}',
  ].join('\n\t');
}
