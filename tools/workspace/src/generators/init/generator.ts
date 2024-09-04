import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { installHuskyTask } from '../../devkit';

import { InitGeneratorSchema } from './schema';
import { addHusky, addLintStaged } from './tasks';
import { normalizeOptions } from './utils';

export async function initGenerator(tree: Tree, schema: InitGeneratorSchema) {
  const options = normalizeOptions(tree, schema);

  addHusky(tree);
  addLintStaged(tree, options);

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    installHuskyTask(tree);
  };
}

export default initGenerator;
