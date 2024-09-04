import { Tree } from '@nx/devkit';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';

import { readPackageJson } from './devkit';

export function getPkgJson(tree: Tree) {
  return readPackageJson(tree);
}

export function getNXVersion(tree: Tree) {
  return getPkgJson(tree).devDependencies?.nx ?? '19.6.4';
}

export function isHuskyInstalled(tree: Tree) {
  return !!getPkgJson(tree)?.devDependencies?.husky;
}

export function updateTSConfigCompilerOptions(
  { compileOnSave, compilerOptions, ...json }: TSConfig,
  options: TSConfig['compilerOptions'] = {}
) {
  const { baseUrl, paths, ...defaultCompilerOptions } = compilerOptions;

  return {
    compileOnSave,
    compilerOptions: { ...defaultCompilerOptions, ...options, baseUrl, paths },
    ...json,
  };
}
