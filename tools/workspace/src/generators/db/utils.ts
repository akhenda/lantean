import { getWorkspaceLayout, names, offsetFromRoot, Tree } from '@nx/devkit';

import { defaultLibDirectory, defaultLibName, defaultLibTags } from './constants';
import { NormalizedSchema, DbGeneratorSchema } from './schema';

import { NormalizedSchema as LoggingLibNormalizedSchema } from '../logging/schema';
import { getImportPath, getNpmScope } from '../../utils';

/**
 * Normalize options for the DB generator.
 *
 * @param tree The virtual file system tree.
 * @param options The options passed to the generator.
 * @param extra The extra options passed to the generator.
 * @returns The normalized options.
 *
 * The normalized options include the following:
 * - `name`: The name of the library.
 * - `projectName`: The name of the project.
 * - `projectRoot`: The path to the project root.
 * - `projectDirectory`: The path to the project directory.
 * - `importPath`: The import path for the library.
 * - `appsDir`: The path to the apps directory.
 * - `libsDir`: The path to the libs directory.
 * - `parsedTags`: The parsed tags for the project.
 * - `npmScope`: The npm scope for the library.
 * - `npmScopeTitle`: The title cased npm scope for the library.
 * - `offsetFromRoot`: The relative path from the workspace root to the library.
 * - `loggingLibName`: The name of the logging library.
 * - `loggingLibImportPath`: The import path for the logging library.
 * - `typesLibName`: The name of the types library.
 * - `typesLibImportPath`: The import path for the types library.
 */
export function normalizeOptions(
  tree: Tree,
  options: DbGeneratorSchema,
  extra: Pick<LoggingLibNormalizedSchema, 'projectName' | 'importPath' | 'typesLibName' | 'typesLibImportPath'>,
): NormalizedSchema {
  const layout = getWorkspaceLayout(tree);
  const name = names(options.name ?? defaultLibName).fileName;
  const project = names(defaultLibDirectory).fileName;
  const appsDir = layout.appsDir === '.' ? 'apps' : layout.appsDir;
  const libsDir = layout.libsDir === '.' ? 'libs' : layout.libsDir;
  const projectDirectory = `${project}/${name}`;
  const projectRoot = `${libsDir}/${projectDirectory}`;
  const importPath = getImportPath(tree, name);
  const npmScope = getNpmScope(tree) ?? name;
  const npmScopeTitle = names(npmScope).className;
  const offsetFromRootPath = offsetFromRoot(projectRoot);

  return {
    ...options,
    appsDir,
    importPath,
    libsDir,
    name: options.name,
    parsedTags: defaultLibTags,
    projectDirectory,
    projectName: name,
    projectRoot,
    npmScope,
    npmScopeTitle,
    offsetFromRoot: offsetFromRootPath,
    loggingLibName: extra.projectName,
    loggingLibImportPath: extra.importPath,
    typesLibName: extra.typesLibName,
    typesLibImportPath: extra.typesLibImportPath,
  };
}
