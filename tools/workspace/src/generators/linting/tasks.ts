import { addDependenciesToPackageJson, Tree } from '@nx/devkit';

import { addEsLintPlugin, isEsLintPluginPresent, updateEsLintProjectConfig } from './eslint-config';
import { eslintConfigFile, eslintLibDepVersions, eslintPluginPrettier, prettierPlugin } from './constants';
import {
  getESLintFlatConfig,
  getImportOrderFlatConfig,
  getSonarJSFlatConfig,
  getTypescriptFlatConfig,
  getUnusedImportsFlatConfig,
} from './flats';
import { setPrettierConfig } from './prettier';

import { addDevDependencyToPackageJson, joinNormalize } from '../../devkit';
import { eslintFlatConfigAddPluginImport, eslintFlatConfigAddPrettierRules } from '../../utils';

/**
 * @internal
 * Adds ESLint recommended rules to the root ESLint configuration.
 *
 * These rules do not require any additional dependencies.
 *
 * @param tree The file system tree.
 */
export function addEsLintRecommendedRules(tree: Tree) {
  const name = 'eslint';
  const lib = '@eslint/js';
  const globalsLib = 'globals';
  const globalsRef = eslintFlatConfigAddPluginImport(tree, eslintConfigFile, globalsLib, globalsLib, true);

  addEsLintPlugin(tree, name, lib, getESLintFlatConfig(globalsRef));
}

/**
 * @internal
 * Adds SonarJS recommended rules to the root ESLint configuration.
 *
 * Requires `eslint-plugin-sonarjs` to be installed.
 *
 * @param tree The file system tree.
 */
export function addSonarJsRecommendedRules(tree: Tree): void {
  const name = 'sonarjs';
  const lib = 'eslint-plugin-sonarjs';

  addDevDependencyToPackageJson(tree, lib, eslintLibDepVersions[lib]);
  addEsLintPlugin(tree, name, lib, getSonarJSFlatConfig());
}

/**
 * @internal
 * Adds `eslint-plugin-unused-imports` rules to the root ESLint configuration.
 *
 * Requires `eslint-plugin-unused-imports` to be installed.
 *
 * @param tree The file system tree.
 */
export function addUnusedImportsRules(tree: Tree): void {
  const name = 'unused-imports';
  const lib = 'eslint-plugin-unused-imports';

  addDevDependencyToPackageJson(tree, lib, eslintLibDepVersions[lib]);
  addEsLintPlugin(tree, name, lib, getUnusedImportsFlatConfig(name));
}

/**
 * @internal
 * Adds TypeScript recommended rules to the root ESLint configuration.
 *
 * Requires `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`
 * to be installed.
 *
 * @param tree The file system tree.
 */
export function addTypescriptRecommendedRules(tree: Tree): void {
  const name = '@typescript-eslint';
  const lib = '@typescript-eslint/eslint-plugin';
  const parserRef = eslintFlatConfigAddPluginImport(
    tree,
    eslintConfigFile,
    'typescript-eslint-parser',
    '@typescript-eslint/parser',
  );

  addEsLintPlugin(tree, name, lib, getTypescriptFlatConfig(name, parserRef));
  addParserOptionsToProjects(tree);
}

/**
 * @internal
 * Adds `eslint-plugin-import` rules to the root ESLint configuration.
 *
 * Requires `eslint-plugin-import` and `eslint-import-resolver-typescript`
 * to be installed.
 *
 * @param tree The file system tree.
 */
export function addImportOrderRules(tree: Tree): void {
  const name = 'import';
  const lib = 'eslint-plugin-import';

  const parserRef = eslintFlatConfigAddPluginImport(
    tree,
    eslintConfigFile,
    'import-resolver',
    'eslint-import-resolver-typescript',
  );

  addDevDependencyToPackageJson(tree, lib);
  addDevDependencyToPackageJson(tree, 'eslint-import-resolver-typescript');
  addEsLintPlugin(tree, name, lib, getImportOrderFlatConfig(name));
}

/**
 * @internal
 * Updates ESLint project configuration by adding `parserOptions.project`
 * with the path to `tsconfig.json` file.
 *
 * @param tree The file system tree.
 */
export function addParserOptionsToProjects(tree: Tree) {
  updateEsLintProjectConfig(tree, (project) => ({
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: [joinNormalize(project.root, 'tsconfig*.json')],
      },
    },
  }));
}

/**
 * @internal
 * Adds `eslint-plugin-prettier` rules to the root ESLint configuration.
 *
 * Requires `eslint-plugin-prettier` to be installed.
 *
 * @param tree The file system tree.
 */
export function addPrettierRules(tree: Tree) {
  setPrettierConfig(tree);

  if (isEsLintPluginPresent(tree, prettierPlugin)) return;

  eslintFlatConfigAddPrettierRules(tree, eslintConfigFile, []);

  addDependenciesToPackageJson(tree, { prettier: eslintLibDepVersions.prettier }, {});
  addDevDependencyToPackageJson(tree, eslintPluginPrettier);
}
