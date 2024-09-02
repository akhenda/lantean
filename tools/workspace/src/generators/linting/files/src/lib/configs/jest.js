module.exports = {
  overrides: [
    {
      extends: [
        'plugin:jest-dom/recommended',
        'plugin:jest/recommended',
        'plugin:jest-formatting/recommended',
        'plugin:@shopify/jest',
      ],
      plugins: ['testing-library'],
      files: [
        '**/test/**/*.[jt]s?(x)',
        '**/tests/**/*.[jt]s?(x)',
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)',
      ],
    },
  ],
};
