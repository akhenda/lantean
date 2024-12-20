import { getWorkspaceLayout, names, Tree } from '@nx/devkit';

import { getImportPath, getNpmScope } from '../../utils';

import { NormalizedSchema, UniversalGeneratorSchema } from './schema';
import { folderNames, libName, uiTags, libTags } from './constants';

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
 * - `lib`: The name of the lib.
 * - `libTags`: The tags for the lib.
 * - `designPath`: The path to the design folder.
 * - `designRoot`: The path to the design folder.
 * - `featuresPath`: The path to the features folder.
 * - `featuresRoot`: The path to the features folder.
 * - `corePath`: The path to the core folder.
 * - `coreRoot`: The path to the core folder.
 */
export function normalizeOptions(
  tree: Tree,
  options: UniversalGeneratorSchema,
): NormalizedSchema {
  const layout = getWorkspaceLayout(tree);
  const appsDir = layout.appsDir === '.' ? 'apps' : layout.appsDir;
  const libsDir = layout.libsDir === '.' ? 'libs' : layout.libsDir;

  const name = names(libName).fileName;
  const ui = names(options.uiName).fileName;
  const lib = names(options.libName).fileName;
  const projectDirectory = name;
  const projectRoot = `${libsDir}/${projectDirectory}`;
  const importPath = getImportPath(tree, name);
  const npmScope = getNpmScope(tree) ?? name;
  const npmScopeTitle = names(npmScope).className;

  const designPath = `${importPath}/design`;
  const designRoot = `${projectRoot}/design`;
  const featuresPath = `${importPath}/features`;
  const featuresRoot = `${projectRoot}/features`;
  const corePath = `${importPath}/core`;
  const coreRoot = `${projectRoot}/core`;

  return {
    ...options,
    appsDir,
    importPath,
    libsDir,
    name: libName,
    npmScope,
    npmScopeTitle,
    projectDirectory,
    projectName: name,
    projectRoot,

    folderNames: { ...folderNames, designUI: ui, designLib: lib },
    paths: {
      design: { path: designPath, root: designRoot },
      features: { path: featuresPath, root: featuresRoot },
      core: { path: corePath, root: coreRoot },
    },
    tags: { ui: uiTags, lib: libTags },
  };
}
