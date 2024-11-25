const typescript = require('../configs/typescript');
const typescriptTypeChecking = require('../configs/typescript-type-checking');
const prettier = require('../configs/prettier');
const jestDOM = require('../configs/jest-dom');
const react = require('../configs/react');

/**
 * Use this for React.js projects.
 */
module.exports = [
  ...typescript,
  ...typescriptTypeChecking,
  ...react,
  ...prettier,
  ...jestDOM,
  {
    rules: {
      // 'import/prefer-default-export': 'off',
      // 'no-use-before-define': ['off', { classes: false, functions: false }],
      // 'react/function-component-definition': [
      //   'error',
      //   {
      //     namedComponents: ['function-declaration', 'arrow-function'],
      //     unnamedComponents: 'arrow-function',
      //   },
      // ],
      // 'react/jsx-props-no-spreading': 'off',
      // // Don't explicitly add .js/.jsx/.tsx/.ts extensions
      // 'import/extensions': [
      //   'error',
      //   'ignorePackages',
      //   {
      //     js: 'never',
      //     jsx: 'never',
      //     ts: 'never',
      //     tsx: 'never',
      //   },
      // ],
      // 'no-param-reassign': ['error', { props: true, ignorePropertyModificationsForRegex: ['^draft'] }],
    },
  },
];
