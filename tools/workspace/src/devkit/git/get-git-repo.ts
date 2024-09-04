import { Tree } from '@nx/devkit';

import { exec } from '../exec';

/**
 * Gets the remote url for current git repo.
 */
export function getGitRepo(tree: Tree): string | null {
  const { output, error } = exec(
    'git',
    ['config', '--get', 'remote.origin.url'],
    { cwd: tree.root }
  );

  if (error != null) {
    console.error(`Could not resolve git repo remote url.`);

    return null;
  }

  return output
    .trim()
    .replace(/^\n*$/g, '')
    .replace(/\.git$/i, '');
}

/**
 * Gets the repo slug for the current git repo.
 */
export function getGitRepoSlug(tree: Tree): string | null {
  const repo = getGitRepo(tree);

  if (repo.includes('git@github.com:')) {
    return getGitRepo(tree)?.replace(/^git@github.com:/, '') ?? null;
  }

  return getGitRepo(tree)?.replace(/^https:\/\/github.com\//, '') ?? null;
}
