import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { SheriffGeneratorSchema } from './schema';
import { generateConfigLib, hasFlatConfig } from './tasks';
import { updateBaseTSConfig } from './utils';

import { formatWorkspaceTask } from '../../devkit';

export async function sheriffGenerator(tree: Tree, options?: SheriffGeneratorSchema) {
  if (!hasFlatConfig(tree)) return;

  await generateConfigLib(tree, options);

  updateBaseTSConfig(tree);

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    formatWorkspaceTask(tree);
  };
}

export default sheriffGenerator;
