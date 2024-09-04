import { Tree } from '@nx/devkit';

import { NormalizedSchema } from './types';
import { CommitlintGeneratorSchema } from './schema';
import { defaultCommitlintConfigFile } from './constants';

import { getGitRepo } from '../../devkit';

/**
 * Normalize options for the commitlint generator.
 *
 * @param tree The virtual file system tree.
 * @param options The options passed to the generator.
 * @returns The normalized options.
 *
 * The normalized options include the following:
 * - `fileName`: The path to the commitlint configuration file. If not provided, the default value is {@link defaultCommitlintConfigFile}.
 * - `gitRepo`: The URL of the git repository.
 * - `appsDir`: The path to the apps directory.
 * - `libsDir`: The path to the libs directory.
 */
export function normalizeOptions(
  tree: Tree,
  options: CommitlintGeneratorSchema,
): NormalizedSchema {
  const fileName = options ? options.configFileName : defaultCommitlintConfigFile;

  return {
    ...options,
    fileName,
    gitRepo: getGitRepo(tree)?.replace(/^git@github\.com:/, 'https://github.com/'),
  };
}

/**
 * The content of the workspace README.md file.
 */
export const readmeContent = `
## Docs
[Commitlint & Semantic Release](./docs/commitlint.md)

## Run tasks
`;
