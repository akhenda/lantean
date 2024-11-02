import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { UniversalExpoGeneratorSchema } from './schema';
import { generateExpoUniversalApp } from './tasks';

import { installAFewUniversalComponents } from '../universal/tasks';

/**
 * Sets up a Universal Design System (UDS) using Expo.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param schema The options passed to the generator.
 *
 * @returns A function that will install the required packages and
 * format the workspace.
 */
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
