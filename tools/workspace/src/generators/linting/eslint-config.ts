import { join } from 'path';
import {
  getProjects,
  ProjectConfiguration,
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import type { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';
import { unique } from 'radash';

import { EsLintConfigurationOverrideRule } from './types';
import { eslintConfigFile } from './constants';

import { getSet, areSetsEqual } from '../../devkit';

/**
 * Writes ESLint configuration to a file in the given `Tree`.
 *
 * @param tree The file system tree.
 * @param eslintConfig The ESLint configuration to write.
 * @param path The path where the ESLint configuration should be written. Defaults to `.eslintrc.json`.
 */
export function writeEsLintConfig(
  tree: Tree,
  eslintConfig: JSONSchemaForESLintConfigurationFiles,
  path = eslintConfigFile
): void {
  writeJson(tree, path, eslintConfig);
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
export function readEsLintConfig(
  tree: Tree,
  path = eslintConfigFile
): JSONSchemaForESLintConfigurationFiles {
  if (!tree.exists(eslintConfigFile)) {
    writeEsLintConfig(
      tree,
      { root: true, ignorePatterns: ['**/*'] },
      eslintConfigFile
    );
  }

  return readJson<JSONSchemaForESLintConfigurationFiles>(tree, path);
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

  return eslintConfig.plugins?.includes(plugin) ?? false;
}

/**
 * Adds an ESLint plugin to the root ESLint configuration.
 *
 * @param tree The file system tree.
 * @param plugin The name of the plugin to add.
 * @param after The name of the plugin after which the plugin should be placed. If
 * not provided, the plugin will be added to the end of the list of plugins.
 */
export function addEsLintPlugin(
  tree: Tree,
  plugin: string,
  after?: string
): void {
  if (isEsLintPluginPresent(tree, plugin)) return;

  const eslintConfig = readEsLintConfig(tree);
  const plugins = [...(eslintConfig.plugins ?? [])];
  const afterPluginIndex = plugins.indexOf(after ?? '');

  if (after == null || afterPluginIndex === -1) {
    plugins.push(plugin);
  } else {
    plugins.splice(afterPluginIndex + 1, 0, plugin);
  }

  eslintConfig.plugins = plugins;
  writeEsLintConfig(tree, eslintConfig);
}

/**
 * Adds an ESLint rule to the root ESLint configuration.
 *
 * The rule is merged with any existing rule that has the same file definition.
 *
 * @param tree The file system tree.
 * @param rule The ESLint rule to add.
 * @param path The path to the ESLint configuration file, defaults to `.eslintrc.json`.
 */
export function addEsLintRules(
  tree: Tree,
  rule: EsLintConfigurationOverrideRule,
  path = eslintConfigFile
): void {
  const eslintConfig = readEsLintConfig(tree, path);

  const overrides = [...(eslintConfig.overrides ?? [])];

  // Check if there is a rule with the existing file definition, if so merge it
  const newRuleFilesSet = getSet(rule.files);
  const existingRule = overrides.filter((override) =>
    areSetsEqual(getSet(override.files), newRuleFilesSet)
  )[0];
  const existingRuleIndex = overrides.indexOf(existingRule);

  if (existingRule == null) {
    overrides.push(rule);
  } else {
    const newRule: EsLintConfigurationOverrideRule = {
      files: existingRule.files,
    };

    if (rule.extends != null || existingRule.extends != null) {
      newRule.extends = unique([
        ...(existingRule.extends ?? []),
        ...(rule.extends ?? []),
      ]);
    }

    const mergedKeys = ['rules', 'parserOptions', 'settings'] as const;
    mergedKeys.forEach((key) => {
      if (rule[key] != null || existingRule[key] != null) {
        newRule[key] = { ...(existingRule[key] ?? {}), ...(rule[key] ?? {}) };
      }
    });

    overrides[existingRuleIndex] = newRule;
  }

  eslintConfig.overrides = overrides;
  writeEsLintConfig(tree, eslintConfig, path);
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
