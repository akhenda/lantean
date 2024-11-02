import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { UniversalNextGeneratorSchema } from './schema';
import { generateNextUniversalApp } from './tasks';

import { installAFewUniversalComponents } from '../universal/tasks';

/**
 * Sets up a Universal Design System (UDS) using Next.js.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param schema The options passed to the generator.
 *
 * @returns A function that will install the required packages and
 * format the workspace.
 */
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
