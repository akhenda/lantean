module.exports = {
  extends: [
    'plugin:security/recommended-legacy',
    'plugin:n/recommended',
    'plugin:@shopify/node',
  ],
  env: { node: true },
  plugins: [],
  rules: {
    'n/no-missing-import': 'off',
  },
};
