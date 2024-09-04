import { getWorkspaceLayout, Tree } from '@nx/devkit';

import { getGitRepo } from '../../devkit';

import { GithubGeneratorSchema, NormalizedSchema } from './schema';

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
