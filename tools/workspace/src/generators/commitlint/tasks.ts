import { join } from 'path';

import {
  addDependenciesToPackageJson,
  generateFiles,
  Tree,
  updateJson,
} from '@nx/devkit';

import { devDependencies } from './constants';
import { NormalizedSchema } from './types';
import { readmeContent } from './utils';

/**
 * Adds all necessary dependencies for the commitlint generator to the
 * project.
 *
 * @param tree The file system tree.
 * @returns The updated dependencies.
 */
export function addDependencies(tree: Tree) {
  const dependencies: Record<string, string> = {};

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

/**
 * Updates the root `package.json` to include the necessary configuration
 * and scripts for the commitlint generator.
 *
 * @param tree The file system tree.
 */
export function updatePackageJson(tree: Tree) {
  updateJson(tree, 'package.json', (packageJson) => {
    packageJson.scripts = {
      ...(packageJson.scripts ?? {}),
      preinstall: 'npx only-allow bun',
      gc: 'git add . && cz',
      'gc-ai': 'git add . && bunx czg ai -N=5',
    };

    return {
      name: packageJson.name,
      version: packageJson.version,
      private: packageJson.private,
      license: packageJson.license,
      workspaces: packageJson.workspaces,
      scripts: packageJson.scripts,
      config: {
        commitizen: {
          path: 'node_modules/cz-git',
          useEmoji: true,
        },
      },
      ...packageJson,
    };
  });
}

/**
 * Updates the root README.md to include a link to the commitlint configuration
 * and semantic release docs
 *
 * @param tree The file system tree
 */
export function updateReadme(tree: Tree) {
  const readmePath = join('.', 'README.md');

  if (!tree.exists(readmePath)) return;

  const oldContent = tree.read(readmePath, 'utf-8');
  const newContent = oldContent.replace('## Run tasks', readmeContent);

  tree.write(readmePath, newContent);
}

/**
 * Adds the commitlint configuration files to the project root.
 *
 * If no `.commitlintrc` file is present, the generator will write one in the
 * format specified by the `fileName` option. If the `fileName` option is not
 * provided, the generator will default to writing a `.commitlintrc.js` file.
 *
 * The generator will also write a `docs` folder in the project root, which
 * contains documentation on how to use the commitlint configuration and
 * semantic release.
 *
 * @param tree The file system tree
 * @param options The normalized generator options
 */
export function addFiles(tree: Tree, options: NormalizedSchema) {
  if (
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
    let format: 'yml' | 'js' | 'json' = 'js';

    if (options.fileName.includes('yaml') || options.fileName.includes('yml')) {
      format = 'yml';
    }

    if (
      options.fileName.includes('json') ||
      options.fileName === '.commitlintrc'
    ) {
      format = 'json';
    }

    generateFiles(tree, join(__dirname, 'files', format), '', options);
    generateFiles(tree, join(__dirname, 'files', 'docs'), '', options);
  }
}
