module.exports = {
  extends: ['plugin:@shopify/core'],
  plugins: ['@shopify'],
  settings: {},
  rules: {
    'no-console': ['error', { allow: ['info', 'warn', 'error', 'table'] }],
  },
};
