import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { ConvexGeneratorSchema } from './schema';
import { generateConvexLib, initialiseConvex } from './tasks';
import { normalizeOptions } from './utils';

export async function convexGenerator(tree: Tree, schema: ConvexGeneratorSchema) {
  const options = normalizeOptions(tree, schema);

  await generateConvexLib(tree, options);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    initialiseConvex();

    return { options };
  };
}

export default convexGenerator;
