import { join } from 'path';

import { addDependenciesToPackageJson, generateFiles, Tree } from '@nx/devkit';
import { libraryGenerator } from '@nx/js';

import { deps } from './constants';
import { NormalizedSchema } from './schema';

/**
 * Deletes unnecessary files from the library.
 *
 * The library is created by `@nx/js` and contains unnecessary
 * files such as `src/index.ts` that need to be deleted.
 *
 * @param tree The file system tree.
 * @param libDirectory The directory of the library.
 */
function cleanupLib(tree: Tree, libDirectory: string) {
  tree.delete(`${libDirectory}/src/index.ts`);

  const libFiles = tree.children(`${libDirectory}/src/lib`);

  for (const file of libFiles) {
    tree.delete(`${libDirectory}/src/lib/${file}`);
  }
}

/**
 * Adds all necessary dependencies for the types generator to the project.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @returns The updated dependencies.
 */
export function addDependencies(tree: Tree) {
  const dependencies: Record<string, string> = deps;
  const devDependencies: Record<string, string> = {};

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

/**
 * Generates the necessary files for the Types library.
 *
 * This function uses a template to generate files within the specified
 * project root directory. It utilizes the provided options to configure
 * file generation, including npm scope and naming conventions.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator, containing
 * details such as project name and root directory.
 */
export function addLibFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = { ...options, template: '' };

  generateFiles(tree, join(__dirname, 'files'), options.projectRoot, templateOptions);
}

/**
 * Generates a Types library.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The options passed to the generator.
 *
 * The generator creates a new library with the given name and options,
 * and configures it to use ESlint and TypeScript. It also adds the
 * necessary dependencies and generates the necessary files.
 */
export async function generateTypesLib(tree: Tree, options: NormalizedSchema) {
  await libraryGenerator(tree, {
    compiler: 'tsc',
    directory: options.projectRoot,
    linter: 'eslint',
    name: options.projectName,
    projectNameAndRootFormat: 'as-provided',
    setParserOptionsProject: true,
    strict: true,
    tags: options.parsedTags.join(','),
  });

  cleanupLib(tree, options.projectRoot);
  addLibFiles(tree, options);
  addDependencies(tree);
}
