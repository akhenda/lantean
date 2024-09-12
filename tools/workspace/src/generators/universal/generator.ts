import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { formatWorkspaceTask } from '../../devkit';

import { UniversalGeneratorSchema } from './schema';
import { generateUniversalLib } from './tasks';
import { normalizeOptions } from './utils';

/**
 * Sets up a Universal Design System (UDS) using Gluestack.io
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param schema The options passed to the generator.
 *
 * @returns A function that will install the required packages and
 * format the workspace.
 */
export async function universalGenerator(
  tree: Tree,
  schema: UniversalGeneratorSchema
) {
  const options = normalizeOptions(tree, schema);

  await generateUniversalLib(tree, options);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    formatWorkspaceTask(tree);
  };
}

export default universalGenerator;
