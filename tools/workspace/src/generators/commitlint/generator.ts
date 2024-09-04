import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { CommitlintGeneratorSchema } from './schema';
import {
  addDependencies,
  addFiles,
  updatePackageJson,
  updateReadme,
} from './tasks';
import { normalizeOptions } from './utils';

/**
 * Generator to set up Commitlint & Semantic Release in a workspace.
 *
 * @param tree - The abstract syntax tree of the workspace.
 * @param schema - The options passed to the generator.
 *
 * @returns A function that will install the required packages if called.
 */
export async function commitlintGenerator(
  tree: Tree,
  schema?: CommitlintGeneratorSchema,
) {
  const options = normalizeOptions(tree, schema);

  addDependencies(tree);
  updatePackageJson(tree);
  updateReadme(tree);
  addFiles(tree, options);

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
  };
}

export default commitlintGenerator;
