import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { generateConfigLib } from './lib';
import { normalizeOptions } from './utils';
import { LintingGeneratorSchema } from './schema';
import {
  addDeprecationRules,
  addEsLintRecommendedRules,
  addImportOrderRules,
  addPrettierRules,
  addSonarJsRecommendedRules,
  addTypescriptRecommendedRules,
  addUnusedImportsRules,
} from './tasks';

import { formatWorkspaceTask, lintWorkspaceTask } from '../../devkit';

/**
 * Nx generator to setup ESLint in a workspace.
 */
export default async function eslintGenerator(
  tree: Tree,
  options?: LintingGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);

  if (normalizedOptions.lib) generateConfigLib(tree, normalizedOptions);
  if (normalizedOptions.eslintRecommended) addEsLintRecommendedRules(tree);
  if (normalizedOptions.sonarJs) addSonarJsRecommendedRules(tree);
  if (normalizedOptions.unusedImports) addUnusedImportsRules(tree);
  if (normalizedOptions.typescriptRecommended) addTypescriptRecommendedRules(tree);
  if (normalizedOptions.deprecation) addDeprecationRules(tree);
  if (normalizedOptions.importOrder) addImportOrderRules(tree);
  if (normalizedOptions.prettier) addPrettierRules(tree);

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    lintWorkspaceTask(tree);
    formatWorkspaceTask(tree);
  };
}
