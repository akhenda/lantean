import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { UniversalExpoGeneratorSchema } from './schema';
import { generateExpoUniversalApp } from './tasks';

import { installAFewUniversalComponents } from '../universal/tasks';

export async function universalExpoGenerator(
  tree: Tree,
  schema: UniversalExpoGeneratorSchema,
) {
  const options = await generateExpoUniversalApp(tree, schema);

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    installAFewUniversalComponents(options.universalLibName);
  };
}

export default universalExpoGenerator;
