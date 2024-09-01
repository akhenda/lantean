/**
 * Use this for React Native or Expo projects.
 */
module.exports = {
  extends: './react.js',
  env: { browser: false },
  overrides: [],
  rules: {
    'react/style-prop-object': ['error', { allow: ['StatusBar'] }],
  },
};
