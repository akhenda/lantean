const pluginCypress = require('eslint-plugin-cypress/flat');
const pluginTestingLibrary = require('eslint-plugin-testing-library');

module.exports = [
  {
    files: [
      '**/test/**/*.[jt]s?(x)',
      '**/tests/**/*.[jt]s?(x)',
      '**/__tests__/**/*.[jt]s?(x)',
      '**/?(*.)+(spec|test).[jt]s?(x)',
    ],

    ...pluginCypress.configs.recommended,
    ...pluginCypress.configs.globals,
    ...pluginTestingLibrary.configs['flat/dom'],

    plugins: {
      cypress: pluginCypress,
      'testing-library': pluginTestingLibrary,
    },
    rules: {
      'cypress/unsafe-to-chain-command': 'error',
      'cypress/no-unnecessary-waiting': 'off',
    },
  },
];
