module.exports = {
  extends: ['plugin:@shopify/react', 'plugin:react/jsx-runtime'],
  settings: {
    react: { version: 'detect' },
  },
  overrides: [
    {
      files: ['**/*.test.*', '**/*.spec.*'],
      rules: {
        'shopify/jsx-no-hardcoded-content': 'off',
      },
    },
  ],
  rules: {},
};
