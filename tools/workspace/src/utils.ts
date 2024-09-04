import { Tree } from '@nx/devkit';
import { readPackageJson } from './devkit';

export function getPkgJson(tree: Tree) {
  return readPackageJson(tree);
}

export function getNXVersion(tree: Tree) {
  return getPkgJson(tree).devDependencies?.nx ?? '19.6.4';
}

export function isHuskyInstalled(tree: Tree) {
  return !!getPkgJson(tree).devDependencies?.husky;
}
