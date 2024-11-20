import { addDependenciesToPackageJson, Tree } from '@nx/devkit';

import { deps, devDeps } from './constants';
import { NormalizedSchema } from './schema';

export function addDependencies(tree: Tree) {
  const dependencies: Record<string, string> = deps;
  const devDependencies: Record<string, string> = devDeps;

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

export async function generateSaaSConvexLib(tree: Tree, options: NormalizedSchema) {
  addDependencies(tree);

  return options;
}
