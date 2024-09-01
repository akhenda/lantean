/**
 * Use this for Node.js projects.
 */
module.exports = {
  extends: [
    '../configs/typescript.js',
    '../configs/typescript-type-checking.js',
    '../configs/node.js',
    '../configs/jest.js',
    '../configs/prettier.js',
  ],
  env: { node: true },
  overrides: [
    {
      files: '*.json',
      parser: 'jsonc-eslint-parser',
      rules: {},
    },
  ],
};
