import { join } from 'path';

import { getProjects, ProjectConfiguration, Tree } from '@nx/devkit';
import type { FlatESLintConfig } from 'eslint-define-config';

import { eslintFlatConfigAddPlugin, eslintFlatConfigUpdateParserOptions } from '../../utils';

import { eslintConfigFile } from './constants';

/**
 * Writes ESLint configuration to a file in the given `Tree`.
 *
 * @param tree The file system tree.
 * @param eslintConfig The ESLint configuration to write.
 * @param path The path where the ESLint configuration should be written.
 * Defaults to `eslint.config.js`.
 */
export function writeEsLintConfig(tree: Tree, eslintConfig: FlatESLintConfig[], path = eslintConfigFile): void {
  tree.write(path, JSON.stringify(eslintConfig));
}

/**
 * Reads ESLint configuration from the given path.
 *
 * If the file does not exist, it is created with a default configuration.
 *
 * @param tree The file system tree.
 * @param path The path to the ESLint configuration file.
 * @returns The ESLint configuration.
 */
export function readEsLintConfig(tree: Tree, path = eslintConfigFile) {
  if (!tree.exists(path)) writeEsLintConfig(tree, [{ ignores: ['**/*'] }], path);

  return tree.read(path)?.toString();
}

/**
 * Checks if an ESLint plugin is present in the root ESLint configuration.
 *
 * @param tree The file system tree.
 * @param plugin The name of the plugin to check.
 * @returns `true` if the plugin is present, `false` otherwise.
 */
export function isEsLintPluginPresent(tree: Tree, plugin: string): boolean {
  const eslintConfig = readEsLintConfig(tree);

  if (eslintConfig.includes(plugin)) {
    if (eslintConfig.includes(`${plugin}:`) || eslintConfig.includes(`'${plugin}':`)) return true;
  }

  return false;
}

/**
 * Adds an ESLint plugin to the root ESLint configuration.
 *
 * @param tree The file system tree.
 * @param plugin The name of the plugin to add.
 * @param after The name of the plugin after which the plugin should be placed.
 * If not provided, the plugin will be added to the end of the list of plugins.
 */
export function addEsLintPlugin(tree: Tree, plugin: string, importPath: string, config: string) {
  if (isEsLintPluginPresent(tree, plugin)) return;

  eslintFlatConfigAddPlugin(tree, eslintConfigFile, plugin, importPath, config);
}

/**
 * Updates ESLint project configuration.
 *
 * @param tree The file system tree.
 * @param projectRule A rule that takes a project configuration and returns an
 * ESLint configuration override rule.
 */
export function updateEsLintProjectConfig(
  tree: Tree,
  projectRule: (project: ProjectConfiguration) => FlatESLintConfig,
) {
  const projects = getProjects(tree);

  projects.forEach((project: ProjectConfiguration) => {
    const eslintConfigProjectFile = join(project.root, eslintConfigFile);

    if (!tree.exists(eslintConfigProjectFile)) return;

    eslintFlatConfigUpdateParserOptions(tree, eslintConfigProjectFile, projectRule(project));
  });
}
