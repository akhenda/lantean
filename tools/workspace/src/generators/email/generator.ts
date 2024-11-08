import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { EmailGeneratorSchema } from './schema';
import { generateEmailLib } from './tasks';
import { normalizeOptions } from './utils';

export async function emailGenerator(tree: Tree, schema: EmailGeneratorSchema) {
  const options = normalizeOptions(tree, schema);

  await generateEmailLib(tree, options);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);

    return { options };
  };
}

export default emailGenerator;
