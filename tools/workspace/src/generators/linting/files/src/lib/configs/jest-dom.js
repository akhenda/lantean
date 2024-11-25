const jestDOM = require('eslint-plugin-jest-dom');
const pluginTestingLibrary = require('eslint-plugin-testing-library');

const jestConfig = require('./jest');

module.exports = [
  ...jestConfig,

  /**
   * eslint-plugin-jest-dom
   */
  {
    files: [
      '**/test/**/*.[jt]s?(x)',
      '**/tests/**/*.[jt]s?(x)',
      '**/__tests__/**/*.[jt]s?(x)',
      '**/?(*.)+(spec|test).[jt]s?(x)',
    ],
    ...jestDOM.configs['flat/recommended'],
    rules: {},
  },

  /**
   * eslint-plugin-testing-library
   */
  {
    files: [
      '**/test/**/*.[jt]s?(x)',
      '**/tests/**/*.[jt]s?(x)',
      '**/__tests__/**/*.[jt]s?(x)',
      '**/?(*.)+(spec|test).[jt]s?(x)',
    ],

    ...pluginTestingLibrary.configs['flat/dom'],

    plugins: {
      'testing-library': pluginTestingLibrary,
    },

    rules: {},
  },
];
