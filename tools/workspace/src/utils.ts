import { readJson, Tree } from '@nx/devkit';

export function getPkgJson(tree: Tree) {
  return readJson(tree, 'package.json');
}

export function getNXVersion(tree: Tree) {
  return getPkgJson(tree).devDependencies?.nx ?? '19.6.4';
}
