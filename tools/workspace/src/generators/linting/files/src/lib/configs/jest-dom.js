module.exports = {
  overrides: {
    extends: [
      'plugin:jest/recommended',
      'plugin:jest-formatting/recommended',
      'plugin:jest-dom/recommended',
      'plugin:testing-library/react',
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
};
