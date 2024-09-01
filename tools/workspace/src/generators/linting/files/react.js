/**
 * Use this for React.js projects.
 */
module.exports = {
  extends: 'plugin:@hendacorp/reactful',
  env: { browser: true },
  overrides: [
    {
      files: '*.json',
      extends: ['./configs/prettier.js'],
      parser: 'jsonc-eslint-parser',
      rules: {},
    },
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {},
    },
    {
      extends: [
        './configs/esnext.js',
        './configs/react.js',
        './configs/prettier.js',
        './configs/jest-dom.js',
      ],
      files: ['*.js', '*.jsx'],
      rules: {},
    },
    {
      extends: [
        './configs/typescript.js',
        './configs/typescript-type-checking.js',
        './configs/react.js',
        './configs/prettier.js',
        './configs/jest-dom.js',
      ],
      files: ['*.ts', '*.tsx'],
      settings: {
        'import/resolver': {
          typescript: {
            project: 'tsconfig.base.json',
          },
        },
      },
      rules: {
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-misused-promises': [
          2,
          { checksVoidReturn: { attributes: false } },
        ],
      },
    },
  ],
  rules: {},
};
