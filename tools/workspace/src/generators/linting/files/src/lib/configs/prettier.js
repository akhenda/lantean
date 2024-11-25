const yml = require('eslint-plugin-yml');

// const prettierPlugin = require('eslint-plugin-prettier');
// const prettierConfig = require('eslint-config-prettier');

module.exports = [
  /**
   * `eslint-config-prettier`. Starting from ESLint v8.53.0, ESLint stopped shipping formatting
   * rules, and shortly after `@typesript/eslint` followed suit. This change made
   * `eslint-config-prettier` completely irrelevant and now the only formatting rules left in
   * Sheriff are `@stylistic/padding-line-between-statements` and `curly`, which don't conflict
   * with Prettier.
   *
   * Ref: https://github.com/AndreaPontrandolfo/sheriff/blob/master/apps/docs-website/docs/prettier-support.md#usage
   */
  // prettierConfig,

  {
    plugins: {
      /**
       * `eslint-plugin-prettier`. Its use is discouraged by the Prettier team itself, as it just
       * slows down your editor. It's better to just let ESLint and Prettier run side-by-side.
       *
       * Ref: https://github.com/AndreaPontrandolfo/sheriff/blob/master/apps/docs-website/docs/prettier-support.md#usage
       */
      // prettier: prettierPlugin,
    },

    rules: {
      // 'prettier/prettier': 'error',

      // rules to disable to prefer prettier
      '@babel/semi': 'off',
      '@babel/object-curly-spacing': 'off',
      '@shopify/class-property-semi': 'off',
      '@shopify/binary-assignment-parens': 'off',
      'prefer-arrow-callback': 'off',
      'arrow-body-style': 'off',

      // Special rule for 'no-unexpected-multiline'
      // https://github.com/prettier/eslint-config-prettier/blob/5399175c37466747aae9d407021dffec2c169c8b/README.md#no-unexpected-multiline
      'no-unexpected-multiline': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/quotes': 'off',
      '@typescript-eslint/brace-style': 'off',
      '@typescript-eslint/func-call-spacing': 'off',
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/member-delimiter-style': 'off',
      '@typescript-eslint/no-extra-parens': 'off',
      '@typescript-eslint/semi': 'off',
      '@typescript-eslint/type-annotation-spacing': 'off',
      '@typescript-eslint/object-curly-spacing': 'off',
    },
  },

  /**
   * eslint-plugin-yml
   */
  ...yml.configs['flat/prettier'],

  {
    rules: {},
  },
];
