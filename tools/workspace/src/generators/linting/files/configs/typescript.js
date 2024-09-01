module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@shopify/typescript',
    './esnext.js',
  ],
  plugins: [],
  rules: {},

  overrides: [
    {
      files: ['*.d.ts'],
      rules: {
        'import/order': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      settings: {},
      rules: {
        'no-undef': 'off',
        '@typescript-eslint/consistent-indexed-object-style': [
          'error',
          'record',
        ],

        // turn on errors for missing imports
        'import/no-unresolved': 'error',

        '@typescript-eslint/ban-types': [
          'error',
          {
            types: {
              Number: { message: 'Use `number` instead.', fixWith: 'number' },
              Boolean: {
                message: 'Use `boolean` instead.',
                fixWith: 'boolean',
              },
              Symbol: { message: 'Use `symbol` instead.', fixWith: 'symbol' },
              Object: { message: 'Use `object` instead.', fixWith: 'object' },
              String: { message: 'Use `string` instead.', fixWith: 'string' },
              '{}': { message: 'Use `object` instead.', fixWith: 'object' },
              Array: { message: 'Provide a more specific type' },
            },
            extendDefaults: false,
          },
        ],
      },
    },
  ],
};
