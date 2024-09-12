import { getWorkspaceLayout, names, Tree } from '@nx/devkit';

import { getImportPath, getNpmScope } from '../../utils';

import { NormalizedSchema, UniversalGeneratorSchema } from './schema';
import { libName, uiTags, utilsTags } from './constants';

/**
 * Normalize options for the Universal generator.
 *
 * @param tree The virtual file system tree.
 * @param options The options passed to the generator.
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
 * - `ui`: The name of the ui lib.
 * - `uiTags`: The tags for the ui lib.
 * - `utils`: The name of the utils lib.
 * - `utilsTags`: The tags for the utils lib.
 * - `designPath`: The path to the design folder.
 * - `designRoot`: The path to the design folder.
 * - `featuresPath`: The path to the features folder.
 * - `featuresRoot`: The path to the features folder.
 * - `hooksPath`: The path to the hooks folder.
 * - `hooksRoot`: The path to the hooks folder.
 * - `providersPath`: The path to the providers folder.
 * - `providersRoot`: The path to the providers folder.
 * - `storesPath`: The path to the stores folder.
 * - `storesRoot`: The path to the stores folder.
 * - `utilsPath`: The path to the utils folder.
 * - `utilsRoot`: The path to the utils folder.
 */
export function normalizeOptions(
  tree: Tree,
  options: UniversalGeneratorSchema
): NormalizedSchema {
  const layout = getWorkspaceLayout(tree);
  const appsDir = layout.appsDir === '.' ? 'apps' : layout.appsDir;
  const libsDir = layout.libsDir === '.' ? 'libs' : layout.libsDir;

  const name = names(libName).fileName;
  const ui = names(options.uiName).fileName;
  const utils = names(options.utilsName).fileName;
  const projectDirectory = name;
  const projectRoot = `${libsDir}/${projectDirectory}`;
  const importPath = getImportPath(tree, name);
  const npmScope = getNpmScope(tree) ?? name;

  const designPath = `${importPath}/design`;
  const designRoot = `${projectRoot}/design`;
  const featuresPath = `${importPath}/features`;
  const featuresRoot = `${projectRoot}/features`;
  const hooksPath = `${importPath}/hooks`;
  const hooksRoot = `${projectRoot}/hooks`;
  const providersPath = `${importPath}/providers`;
  const providersRoot = `${projectRoot}/providers`;
  const storesPath = `${importPath}/stores`;
  const storesRoot = `${projectRoot}/stores`;
  const utilsPath = `${importPath}/utils`;
  const utilsRoot = `${projectRoot}/utils`;

  return {
    ...options,
    appsDir,
    importPath: getImportPath(tree, name),
    libsDir,
    name: libName,
    npmScope,
    npmScopeTitle: names(npmScope).className,
    projectDirectory,
    projectName: name,
    projectRoot,
    ui,
    uiTags,
    utils,
    utilsTags,

    designPath,
    designRoot,
    featuresPath,
    featuresRoot,
    hooksPath,
    hooksRoot,
    providersPath,
    providersRoot,
    storesPath,
    storesRoot,
    utilsPath,
    utilsRoot,
  };
}
