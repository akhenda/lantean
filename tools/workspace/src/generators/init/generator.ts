import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { installHuskyTask } from '../../devkit';

import { InitGeneratorSchema } from './schema';
import { addHusky, addLintStaged } from './tasks';
import { normalizeOptions } from './utils';

/**
 * Configures Husky & Lint Staged.
 *
 * @param tree The file system tree.
 * @param schema The options passed to the generator.
 *
 * @returns A function that will install the required packages and install
 * Husky if called.
 */
export async function initGenerator(tree: Tree, schema?: InitGeneratorSchema) {
  const options = normalizeOptions(schema);

  addHusky(tree);
  addLintStaged(tree, options);

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    installHuskyTask(tree);
  };
}

export default initGenerator;
