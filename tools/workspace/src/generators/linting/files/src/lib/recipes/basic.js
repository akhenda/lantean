/**
 * Use this for casual js/typescript projects.
 */
module.exports = {
  overrides: [
    {
      files: '*.json',
      extends: ['../configs/prettier.js'],
      parser: 'jsonc-eslint-parser',
      rules: {},
    },
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {},
    },
    {
      extends: ['../configs/esnext.js', '../configs/prettier.js'],
      files: ['*.js', '*.jsx'],
      rules: {},
    },
    {
      extends: [
        '../configs/typescript.js',
        '../configs/typescript-type-checking.js',
        '../configs/prettier.js',
      ],
      files: ['*.ts', '*.tsx'],
      settings: {
        // 'import/parsers': {
        //   '@typescript-eslint/parser': ['.ts', '.tsx'],
        // },
        'import/resolver': {
          typescript: {
            project: 'tsconfig.base.json',
          },
        },
      },
      rules: {},
    },
    {
      files: [
        '**/test/**/*.[jt]s?(x)',
        '**/tests/**/*.[jt]s?(x)',
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)',
      ],
      env: { jest: true },
      extends: ['../configs/jest.js'],
    },
  ],
};
