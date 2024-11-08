import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { KvGeneratorSchema } from './schema';
import { generateJobsLib } from './tasks';
import { normalizeOptions } from './utils';

export async function kvGenerator(tree: Tree, schema: KvGeneratorSchema) {
  const options = normalizeOptions(tree, schema);

  await generateJobsLib(tree, options);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);

    return { options };
  };
}

export default kvGenerator;
