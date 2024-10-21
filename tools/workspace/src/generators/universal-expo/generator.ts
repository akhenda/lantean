import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { UniversalExpoGeneratorSchema } from './schema';
import { generateExpoUniversalApp, installAFewUniversalComponents } from './tasks';

export async function universalExpoGenerator(tree: Tree, schema: UniversalExpoGeneratorSchema) {
  await generateExpoUniversalApp(tree, schema);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    installAFewUniversalComponents()
  };
}

export default universalExpoGenerator;
