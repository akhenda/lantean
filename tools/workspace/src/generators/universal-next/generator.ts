import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { UniversalNextGeneratorSchema } from './schema';
import { generateNextUniversalApp } from './tasks';

import { installAFewUniversalComponents } from '../universal/tasks';

export async function universalNextGenerator(
  tree: Tree,
  schema: UniversalNextGeneratorSchema,
) {
  const options = await generateNextUniversalApp(tree, schema);

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    installAFewUniversalComponents(options.universalLibName);
  };
}

export default universalNextGenerator;
