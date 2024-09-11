import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { EnvGeneratorSchema } from './schema';
import { generateEnvLib } from './tasks';

export async function envGenerator(tree: Tree, options: EnvGeneratorSchema) {
  await generateEnvLib(tree, options);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
  };
}

export default envGenerator;
