import { SchemaForPrettierrc } from '@schemastore/prettierrc';
import { prettierConfigFile, prettierConfigJsonFile } from './constants';
import { readJson, Tree, writeJson } from '@nx/devkit';

/**
 * Prettier default configuration.
 */
export const prettierDefaultConfig: Exclude<SchemaForPrettierrc, string> = {
  printWidth: 120,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always',
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'html',
      },
    },
  ],
};

/**
 * Sets Prettier configuration.
 *
 * If the configuration doesn't exist, it creates one with the default configuration.
 *
 * @param tree The file system tree.
 */
export function setPrettierConfig(tree: Tree): void {
  if (tree.exists(prettierConfigJsonFile)) return;
  if (!tree.exists(prettierConfigFile)) writeJson(tree, prettierConfigFile, {});

  let prettierConfig = readJson<Exclude<SchemaForPrettierrc, string>>(
    tree,
    prettierConfigFile
  );

  prettierConfig = { ...prettierDefaultConfig, ...prettierConfig };
  writeJson(tree, prettierConfigFile, prettierConfig);
  tree.rename(prettierConfigFile, prettierConfigJsonFile);
}
