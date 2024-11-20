import { getWorkspaceLayout, names, Tree } from '@nx/devkit';

import { libTags, defaultUIName, defaultLibName } from './constants';
import { NormalizedSchema, UniversalExpoGeneratorSchema } from './schema';

import { normalizeOptions as normalizeUniversalOptions } from '../universal/utils';
import { getImportPath, getNpmScope } from '../../utils';

/**
 * Normalize options for the Universal Expo generator.
 *
 * @param tree The virtual file system tree.
 * @param options The options passed to the generator.
 * @returns The normalized options.
 *
 * The normalized options include the following:
 * - `name`: The name of the app.
 * - `displayName`: The display name of the app.
 * - `projectName`: The name of the project.
 * - `projectRoot`: The path to the project root.
 * - `projectDirectory`: The path to the project directory.
 * - `importPath`: The import path for the app.
 * - `appsDir`: The path to the apps directory.
 * - `libsDir`: The path to the libs directory.
 * - `tags`: The tags for the lib.
 */
export function normalizeOptions(tree: Tree, options: UniversalExpoGeneratorSchema): NormalizedSchema {
  const layout = getWorkspaceLayout(tree);
  const appsDir = layout.appsDir === '.' ? 'apps' : layout.appsDir;
  const libsDir = layout.libsDir === '.' ? 'libs' : layout.libsDir;

  const name = names(options.name).fileName;
  const projectDirectory = name;
  const projectRoot = `${appsDir}/${projectDirectory}`;
  const importPath = getImportPath(tree, name);
  const npmScope = getNpmScope(tree) ?? name;
  const npmScopeTitle = names(npmScope).className;

  const {
    projectName: universalLibName,
    importPath: universalLibImportPath,
    uiName: universalLibUIName,
    libName: universalLibLibName,
  } = normalizeUniversalOptions(tree, {
    uiName: options.uiName ?? defaultUIName,
    libName: options.libName ?? defaultLibName,
    skipFormat: options.skipFormat,
  });

  return {
    ...options,
    appsDir,
    importPath,
    libsDir,
    name,
    displayName: options.displayName ?? options.name,
    npmScope,
    npmScopeTitle,
    projectDirectory,
    projectName: name,
    projectRoot,
    tags: libTags,

    names: names(name),

    uiName: universalLibUIName,
    libName: universalLibLibName,
    universalLibName,
    universalLibImportPath,
  };
}
