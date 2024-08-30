import { join } from 'path';
import { getProjects, ProjectConfiguration, Tree } from '@nx/devkit';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';

import {
  addEsLintPlugin,
  addEsLintRules,
  readEsLintConfig,
  writeEsLintConfig,
} from './eslint-config';
import {
  deprecationRule,
  esLintRule,
  importOrderRule,
  sonarJSRule,
  typescriptRule,
  unusedImportsRule,
} from './rules';
import { EsLintConfigurationOverrideRule } from './types';
import { eslintConfigFile } from './constants';
import { addDevDependencyToPackageJson, joinNormalize } from '../../devkit';


/**
 * @internal
 * Adds ESLint recommended rules to the root ESLint configuration.
 *
 * These rules do not require any additional dependencies.
 *
 * @param tree The file system tree.
 */
export function addEsLintRecommendedRules(tree: Tree): void {
  addEsLintRules(tree, esLintRule);

  const eslintConfig = readEsLintConfig(tree);
  const env = {
    ...(eslintConfig.env, {}),
  } as Exclude<JSONSchemaForESLintConfigurationFiles['env'], undefined>;

  env.node = true;
  env.browser = true;
  env.es2022 = true;
  eslintConfig.env = env;

  writeEsLintConfig(tree, eslintConfig);
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
  addDevDependencyToPackageJson(tree, 'eslint-plugin-sonarjs');
  addEsLintPlugin(tree, 'sonarjs');
  addEsLintRules(tree, sonarJSRule);
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
  addDevDependencyToPackageJson(tree, 'eslint-plugin-unused-imports');
  addEsLintPlugin(tree, 'unused-imports');
  addEsLintRules(tree, unusedImportsRule);
}

/**
 * @internal
 * Adds TypeScript recommended rules to the root ESLint configuration.
 *
 * Requires `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin` to be installed.
 *
 * @param tree The file system tree.
 */
export function addTypescriptRecommendedRules(tree: Tree): void {
  addDevDependencyToPackageJson(tree, '@typescript-eslint/parser');
  addDevDependencyToPackageJson(tree, '@typescript-eslint/eslint-plugin');
  addEsLintPlugin(tree, '@typescript-eslint');
  addEsLintRules(tree, typescriptRule);
  addParserOptionsToProjects(tree);
}

/**
 * @internal
 * Adds `eslint-plugin-deprecation` rules to the root ESLint configuration.
 *
 * Requires `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin` and `eslint-plugin-deprecation` to be installed.
 *
 * @param tree The file system tree.
 */
export function addDeprecationRules(tree: Tree): void {
  addDevDependencyToPackageJson(tree, '@typescript-eslint/parser');
  addDevDependencyToPackageJson(tree, '@typescript-eslint/eslint-plugin');
  addDevDependencyToPackageJson(tree, 'eslint-plugin-deprecation');
  addEsLintPlugin(tree, 'deprecation');
  addEsLintRules(tree, deprecationRule);
  addParserOptionsToProjects(tree);
}

/**
 * @internal
 * Adds `eslint-plugin-import` rules to the root ESLint configuration.
 *
 * Requires `eslint-plugin-import` and `eslint-import-resolver-typescript` to be installed.
 *
 * @param tree The file system tree.
 */
export function addImportOrderRules(tree: Tree): void {
  addDevDependencyToPackageJson(tree, 'eslint-plugin-import');
  addDevDependencyToPackageJson(tree, 'eslint-import-resolver-typescript');
  addEsLintPlugin(tree, 'import');
  addEsLintRules(tree, importOrderRule);
}

  /**
   * @internal
   * Updates ESLint project configuration by adding `parserOptions.project` with the path to `tsconfig.json` file.
   *
   * @param tree The file system tree.
   */
export function addParserOptionsToProjects(tree: Tree) {
  updateEsLintProjectConfig(tree, (project) => ({
    files: ['*.ts', '*.tsx'],
    parserOptions: {
      project: [joinNormalize(project.root, 'tsconfig*.json')],
    },
  }));
}

  /**
   * Updates ESLint project configuration.
   *
   * @param tree The file system tree.
   * @param projectRule A rule that takes a project configuration and returns an ESLint configuration override rule.
   */
export function updateEsLintProjectConfig(
  tree: Tree,
  projectRule: (
    project: ProjectConfiguration
  ) => EsLintConfigurationOverrideRule
) {
  const projects = getProjects(tree);
  projects.forEach((project: ProjectConfiguration) => {
    const eslintConfigProjectFile = join(project.root, eslintConfigFile);

    if (!tree.exists(eslintConfigProjectFile)) return;

    addEsLintRules(tree, projectRule(project), eslintConfigProjectFile);
  });
}
