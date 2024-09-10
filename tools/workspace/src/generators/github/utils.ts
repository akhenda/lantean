import { getWorkspaceLayout, Tree } from '@nx/devkit';

import { getGitRepo } from '../../devkit';

import { GithubGeneratorSchema, NormalizedSchema } from './schema';

/**
 * Normalize options for the GitHub generator.
 *
 * @param tree The virtual file system tree.
 * @param options The options passed to the generator.
 * @returns The normalized options.
 *
 * The normalized options include the following:
 * - `appsDir`: The path to the apps directory.
 * - `libsDir`: The path to the libs directory.
 * - `gitRepo`: The URL of the git repository.
 */
export function normalizeOptions(
  tree: Tree,
  options: GithubGeneratorSchema
): NormalizedSchema {
  const layout = getWorkspaceLayout(tree);
  const appsDir = layout.appsDir === '.' ? 'apps' : layout.appsDir;
  const libsDir = layout.libsDir === '.' ? 'libs' : layout.libsDir;

  return {
    ...options,
    appsDir,
    libsDir,
    gitRepo: getGitRepo(tree)?.replace(
      /^git@github\.com:/,
      'https://github.com/'
    ),
  };
}
