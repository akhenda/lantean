import { addDependenciesToPackageJson, Tree } from '@nx/devkit';

import { getNpmPackageVersion } from '../npm';

/**
 * Generator that adds a dev dependency to package.json.
 */
export function addDevDependencyToPackageJson(
  tree: Tree,
  packageName: string,
  version?: string
) {
  const finalVersion = version ?? getNpmPackageVersion(packageName) ?? 'latest';

  addDependenciesToPackageJson(tree, {}, { [packageName]: finalVersion });
}
