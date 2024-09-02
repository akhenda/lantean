import { installPackagesTask, Tree } from '@nx/devkit';

import { generateConfigLib } from './lib';
import { updateBaseTSConfig } from './utils';
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

import { formatWorkspaceTask } from '../../devkit';

/**
 * Nx generator to setup ESLint in a workspace.
 */
export default async function eslintGenerator(
  tree: Tree,
  options?: LintingGeneratorSchema
) {
  if (options?.lib) await generateConfigLib(tree, options);
  if (options?.eslintRecommended) addEsLintRecommendedRules(tree);
  if (options?.sonarJs) addSonarJsRecommendedRules(tree);
  if (options?.unusedImports) addUnusedImportsRules(tree);
  if (options?.typescriptRecommended) addTypescriptRecommendedRules(tree);
  if (options?.deprecation) addDeprecationRules(tree);
  if (options?.importOrder) addImportOrderRules(tree);
  if (options?.prettier) addPrettierRules(tree);
  if (options?.sonarJs) updateBaseTSConfig(tree);

  return () => {
    installPackagesTask(tree);
    formatWorkspaceTask(tree);
  };
}
