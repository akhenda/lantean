import { readJson, Tree } from '@nx/devkit';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';

import { readPackageJson } from './devkit';

/**
 * Reads the root `package.json` file from the given tree.
 *
 * @param tree The file system tree.
 * @returns The parsed content of the `package.json` file, or an empty object
 * if it does not exist.
 */
export function getPkgJson(tree: Tree) {
  return readPackageJson(tree);
}

/**
 * Retrieves the version of Nx installed in the workspace.
 *
 * @param tree The file system tree.
 *
 * @returns The version of Nx installed in the workspace, or '19.6.4' if it is
 * not installed.
 */
export function getNXVersion(tree: Tree) {
  return getPkgJson(tree).devDependencies?.nx ?? '19.6.4';
}

/**
 * Checks if Husky is installed in a workspace.
 *
 * @param tree The file system tree.
 *
 * @returns True if Husky is installed, false otherwise.
 */
export function isHuskyInstalled(tree: Tree) {
  return !!getPkgJson(tree)?.devDependencies?.husky;
}

/**
 * Updates the `compilerOptions` of a TSConfig with the provided options.
 *
 * Preserves the existing `baseUrl` and `paths` options.
 *
 * @param config The TSConfig to update.
 * @param options The options to update `compilerOptions` with.
 * @returns The updated TSConfig.
 */
export function updateTSConfigCompilerOptions(
  { compileOnSave, compilerOptions, ...json }: TSConfig,
  options: TSConfig['compilerOptions'] = {},
) {
  const { baseUrl, paths, ...defaultCompilerOptions } = compilerOptions;

  return {
    compileOnSave,
    compilerOptions: { ...defaultCompilerOptions, ...options, baseUrl, paths },
    ...json,
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
export function getImportPath(tree: Tree, dir: string): string {
  const npmScope = getNpmScope(tree);
  const prefix = npmScope === '@' ? '' : '@';

  return npmScope ? `${prefix}${npmScope}/${dir}` : dir;
}
