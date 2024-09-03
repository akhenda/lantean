import { CommitlintConfigFileName } from './schema';

/**
 * The default name of the commitlint configuration file.
 */
export const defaultCommitlintConfigFile =
  '.commitlintrc.js' as CommitlintConfigFileName;

/**
 * The dependencies required by the generator.
 */
export const devDependencies = {
  '@commitlint/cli': '^19.4.0',
  '@commitlint/config-conventional': '^19.2.2',
  '@commitlint/config-nx-scopes': '^19.3.1',
  '@theunderscorer/nx-semantic-release': '^2.12.0',
  'cz-git': '^1.9.4',
} as const;
