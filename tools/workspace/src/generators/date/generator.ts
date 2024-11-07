import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { DateGeneratorSchema } from './schema';
import { generateDateLib } from './tasks';

export async function dateGenerator(tree: Tree, options: DateGeneratorSchema) {
  await generateDateLib(tree, options);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
  };
}

export default dateGenerator;
