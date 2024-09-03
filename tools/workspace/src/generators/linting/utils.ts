/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  getWorkspaceLayout,
  names,
  readJson,
  Tree,
  updateJson,
} from '@nx/devkit';

import { eslintLibDirectory, eslintLibName, eslintLibTags } from './constants';
import { LintingGeneratorSchema } from './schema';
import { NormalizedSchema } from './types';

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
  options: LintingGeneratorSchema = {},
): NormalizedSchema {
  const layout = getWorkspaceLayout(tree);
  const name = names(eslintLibName).fileName;
  const project = names(eslintLibDirectory).fileName;
  const appsDir = layout.appsDir === '.' ? 'apps' : layout.appsDir;
  const libsDir = layout.libsDir === '.' ? 'libs' : layout.libsDir;
  const projectDirectory = `${project}/${name}`;
  const projectRoot = `${libsDir}/${projectDirectory}`;

  return {
    ...options,
    appsDir,
    importPath: getImportPath(tree, name),
    libsDir,
    name: eslintLibName,
    parsedTags: eslintLibTags,
    projectDirectory,
    projectName: name,
    projectRoot,
  };
}

/**
 * Read the npm scope that a workspace should use by default
 */
export function getNpmScope(tree: Tree): string | undefined {
  const { name } = tree.exists('package.json')
    ? readJson<{ name?: string }>(tree, 'package.json')
    : { name: null };

  if (name?.startsWith('@')) return name.split('/')[0].substring(1);

  return '';
}

/**
 * Prefixes project name with npm scope
 */
export function getImportPath(tree: Tree, projectDirectory: string): string {
  const npmScope = getNpmScope(tree);
  const prefix = npmScope === '@' ? '' : '@';

  return npmScope
    ? `${prefix}${npmScope}/${projectDirectory}`
    : projectDirectory;
}

/**
 * Updates the base TSConfig.
 *
 * - Enables strictNullChecks in the base TSConfig.
 *
 * @param tree The virtual file system tree.
 * @param options The normalized schema options.
 */
export function updateBaseTSConfig(tree: Tree) {
  updateJson(tree, 'tsconfig.base.json', ({ compileOnSave, compilerOptions, ...json }) => {
    const { baseUrl, paths, ...defaultCompilerOptions } = compilerOptions;

    return {
      compileOnSave,
      compilerOptions: {
        ...defaultCompilerOptions,
        strictNullChecks: true,
        baseUrl,
        paths,
      },
      ...json,
    };
  });
}
