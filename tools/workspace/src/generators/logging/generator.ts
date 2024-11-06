import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { LoggingGeneratorSchema } from './schema';
import { generateLoggingLib } from './tasks';

/**
 * Generates a library for type declarations.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The options passed to the generator.
 *
 * The generator creates a new library with the given name and options,
 * and configures it to use ESlint and TypeScript. It also adds the
 * necessary dependencies and generates the necessary files.
 *
 * @returns A function that will install the required packages once called.
 */
export async function loggingGenerator(tree: Tree, options: LoggingGeneratorSchema) {
  await generateLoggingLib(tree, options);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
  };
}

export default loggingGenerator;
