import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { TypesGeneratorSchema } from './schema';
import { generateTypesLib } from './tasks';
import { normalizeOptions } from './utils';

/**
 * Generates a library for type declarations.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param schema The schema passed to the generator.
 *
 * The generator creates a new library with the given name and schema,
 * and configures it to use ESlint and TypeScript. It also adds the
 * necessary dependencies and generates the necessary files.
 *
 * @returns A function that will install the required packages once called.
 */
export async function typesGenerator(tree: Tree, schema?: TypesGeneratorSchema) {
  const options = normalizeOptions(tree, schema ?? {});

  await generateTypesLib(tree, options);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);

    return { options };
  };
}

export default typesGenerator;
