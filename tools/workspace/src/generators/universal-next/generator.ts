import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { UniversalNextGeneratorSchema } from './schema';
import {
  generateNextUniversalApp,
  installAFewUniversalComponents,
} from './tasks';

export async function universalNextGenerator(
  tree: Tree,
  schema: UniversalNextGeneratorSchema,
) {
  await generateNextUniversalApp(tree, schema);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    installAFewUniversalComponents();
  };
}

export default universalNextGenerator;
