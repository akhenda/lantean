import { join } from 'path';

import {
  addDependenciesToPackageJson,
  generateFiles,
  readProjectConfiguration,
  Tree,
  updateJson,
} from '@nx/devkit';

import { devDependencies } from './constants';
import { NormalizedSchema } from './types';
import { readmeContent } from './utils';

export function addDependencies(tree: Tree) {
  const dependencies: Record<string, string> = {};

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

export function updatePackageJson(tree: Tree) {
  updateJson(tree, 'package.json', (packageJson) => {
    packageJson.scripts = {
      ...(packageJson.scripts ?? {}),
      preinstall: 'npx only-allow bun',
      prepare: 'husky',
      gc: 'git add . && cz',
      'gc-ai': 'git add . && bunx czg ai -N=5',
    };

    packageJson.config = {
      commitizen: {
        path: 'node_modules/cz-git',
        useEmoji: true,
      },
    };

    return {
      name: packageJson.name,
      version: packageJson.version,
      private: packageJson.private,
      license: packageJson.license,
      workspaces: packageJson.workspaces,
      scripts: packageJson.scripts,
      ...packageJson,
    };
  });
}

export function updateReadme(tree: Tree) {
  const readmePath = join('.', 'README.md');

  if (!tree.exists(readmePath)) return;

  const oldContent = tree.read(readmePath, 'utf-8');
  const newContent = oldContent.replace(
    'Available for VSCode, IntelliJ and comes with a LSP for Vim users.',
    readmeContent,
  );

  tree.write(readmePath, newContent);
}

export function addFiles(tree: Tree, options: NormalizedSchema) {
  const { root } = readProjectConfiguration(tree, null);
  const isRootProject = root === '.';

  if (
    !isRootProject &&
    !tree.exists('.commitlintrc') &&
    !tree.exists('.commitlintrc.json') &&
    !tree.exists('.commitlintrc.yaml') &&
    !tree.exists('.commitlintrc.yml') &&
    !tree.exists('.commitlintrc.js') &&
    !tree.exists('.commitlintrc.cjs') &&
    !tree.exists('.commitlintrc.mjs') &&
    !tree.exists('.commitlintrc.ts') &&
    !tree.exists('.commitlintrc.cts') &&
    !tree.exists('commitlint.config.js') &&
    !tree.exists('commitlint.config.cjs') &&
    !tree.exists('commitlint.config.mjs') &&
    !tree.exists('commitlint.config.ts') &&
    !tree.exists('commitlint.config.cts')
  ) {
    generateFiles(tree, join(__dirname, 'files', 'root'), '', options);
  }
}
