import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { JobsGeneratorSchema } from './schema';
import { generateJobsLib } from './tasks';
import { normalizeOptions } from './utils';

export async function jobsGenerator(tree: Tree, schema: JobsGeneratorSchema) {
  const options = normalizeOptions(tree, schema);

  await generateJobsLib(tree, options);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);

    return { options };
  };
}

export default jobsGenerator;
