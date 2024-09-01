module.exports = {
  extends: ['plugin:cypress/recommended', 'plugin:testing-library/dom'],
  env: {
    'cypress/globals': true,
  },
  plugins: ['cypress', 'testing-library'],
  rules: {},
};
