import { join, resolve } from 'path';
import { readFileSync } from 'fs';

import { generateFiles, Tree } from '@nx/devkit';

import {
  addBadgeToReadme,
  ciFile,
  getGitRepo,
  joinNormalize,
} from '../../devkit';
import { getImportPath } from '../../utils';

import { NormalizedSchema } from './schema';

/**
 * Adds the GitHub CI workflow files.
 *
 * If an existing ci.yml file is present, it is backed up to ci.yml.original.
 *
 * @param tree The file system tree
 * @param options The normalized generator options
 */
export function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = { ...options, tmpl: '' };

  if (tree.exists(ciFile)) {
    const defaultNXCIFile = tree.read(ciFile, 'utf-8').toString();

    tree.write(ciFile.replace('yml', 'yml.original'), defaultNXCIFile);
    tree.delete(ciFile);
  }

  generateFiles(
    tree,
    joinNormalize(__dirname, 'files'),
    '.github',
    templateOptions
  );
}

/**
 * Logs instructions on how to use Nx Cloud
 *
 * @param tree The file system tree
 * @param options The normalized generator options
 */
export function useNXCloud(tree: Tree, options: NormalizedSchema) {
  if (options.useNxCloud) {
    console.log(
      `In order to use Nx Cloud add a secret with the NX_CLOUD_AUTH_TOKEN`
    );
    console.log(
      `It is suggested that you create a new token for this purpose with read/write access.`
    );
    console.log(`You can configure it at: https://cloud.nx.app/`);
    console.log(
      `Also consider using Nx Cloud GitHub app to access run results: https://github.com/apps/nx-cloud`
    );
    console.log();
  }
}

/**
 * Updates the root README.md to include a badge linking to the CI workflow
 *
 * @param tree The file system tree
 */
export function updateReadMe(tree: Tree) {
  const gitRepo = getGitRepo(tree);

  if (gitRepo == null) {
    console.error(
      `Could not add badge to README, remote repo could not be detected.`
    );
  } else {
    addBadgeToReadme(
      tree,
      `${gitRepo}/actions/workflows/merge.yml/badge.svg`,
      `${gitRepo}/actions/workflows/merge.yml`,
      'CI',
      true
    );
  }
}

/**
 * Updates the root `.gitignore` to include paths to ignore.
 *
 * If the `.gitignore` does not already include the `# ${path}` line,
 * it adds the following files to the `.gitignore`:
 * - `eslint-report.json`
 * - /eslint_report.json`
 *
 * @param tree The file system tree
 */
export function updateGitIgnoreFile(tree: Tree) {
  if (!tree.exists(join(tree.root, '.gitignore'))) return;

  const ignores = readFileSync(resolve(tree.root, '.gitignore'), {
    encoding: 'utf8',
  }).split('\n');

  if (!ignores.includes(`# ${getImportPath(tree, 'github')}`)) {
    const files = [
      `# ${getImportPath(tree, 'github')}`,
      'eslint-report.json',
      '**/*/eslint-report.json',
      'eslint_report.json',
      '**/*/eslint_report.json',
    ];

    if (files.length) ignores.push(...files, '');
  }

  if (ignores.length) tree.write('./.gitignore', ignores.join('\n'));
}
