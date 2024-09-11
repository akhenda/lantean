import { getWorkspaceLayout, names, Tree } from '@nx/devkit';

import { getImportPath } from '../../utils';

import { defaultLibDirectory, defaultLibName, defaultLibTags } from './constants';
import { NormalizedSchema, EnvGeneratorSchema } from './schema';

/**
 * Normalize options for the ESLint generator.
 *
 * @param tree The virtual file system tree.
 * @param options The options passed to the generator.
 * @returns The normalized options.
 *
 * The normalized options include the following:
 * - `name`: The name of the ESLint config library.
 * - `projectName`: The name of the project.
 * - `projectRoot`: The path to the project root.
 * - `projectDirectory`: The path to the project directory.
 * - `parsedTags`: The parsed tags for the project.
 * - `appsDir`: The path to the apps directory.
 * - `libsDir`: The path to the libs directory.
 * - `importPath`: The import path for the ESLint config library.
 */
export function normalizeOptions(
  tree: Tree,
  options: EnvGeneratorSchema = { name: defaultLibName },
): NormalizedSchema {
  const layout = getWorkspaceLayout(tree);
  const name = names(options.name).fileName;
  const project = names(defaultLibDirectory).fileName;
  const appsDir = layout.appsDir === '.' ? 'apps' : layout.appsDir;
  const libsDir = layout.libsDir === '.' ? 'libs' : layout.libsDir;
  const projectDirectory = `${project}/${name}`;
  const projectRoot = `${libsDir}/${projectDirectory}`;

  return {
    ...options,
    appsDir,
    importPath: getImportPath(tree, name),
    libsDir,
    name: options.name,
    parsedTags: defaultLibTags,
    projectDirectory,
    projectName: name,
    projectRoot,
  };
}
