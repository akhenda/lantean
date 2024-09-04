import { join } from 'path';

import { generateFiles, Tree } from '@nx/devkit';

import {
  addDevDependencyToPackageJson,
  addHuskyHook,
  addHuskyToPackageJson,
} from '../../devkit';
import { isHuskyInstalled } from '../../utils';

import { NormalizedSchema } from './schema';

export function addHusky(tree: Tree) {
  addHuskyToPackageJson(tree);
}

export function addLintStaged(tree: Tree, options: NormalizedSchema) {
  addDevDependencyToPackageJson(tree, 'lint-staged');

  if (
    !tree.exists('.lintstagedrc') &&
    !tree.exists('.lintstagedrc.json') &&
    !tree.exists('.lintstagedrc.yaml') &&
    !tree.exists('.lintstagedrc.yml') &&
    !tree.exists('.lintstagedrc.js') &&
    !tree.exists('.lintstagedrc.cjs') &&
    !tree.exists('.lintstagedrc.mjs') &&
    !tree.exists('.lintstagedrc.ts') &&
    !tree.exists('.lintstagedrc.cts') &&
    !tree.exists('lint-staged.config.js') &&
    !tree.exists('lint-staged.config.cjs') &&
    !tree.exists('lint-staged.config.mjs') &&
    !tree.exists('lint-staged.config.ts') &&
    !tree.exists('lint-staged.config.cts')
  ) {
    let format: 'yml' | 'js' | 'json' = 'js';

    if (options.fileName.includes('yaml') || options.fileName.includes('yml')) {
      format = 'yml';
    }

    if (
      options.fileName.includes('json') ||
      options.fileName === '.lintstagedrc'
    ) {
      format = 'json';
    }

    generateFiles(tree, join(__dirname, 'files', format), '', options);
  }

  if (isHuskyInstalled(tree)) {
    addHuskyHook(
      tree,
      'pre-commit',
      'npx lint-staged --concurrent false --relative'
    );
  }
}
