import { CommitlintGeneratorSchema } from './schema';

/**
 * The name of the commitlint configuration file.
 *
 * Ref: https://commitlint.js.org/reference/configuration.html
 */
export type CommitlintConfigFileName =
  | '.commitlintrc'
  | '.commitlintrc.json'
  | '.commitlintrc.yaml'
  | '.commitlintrc.yml'
  | '.commitlintrc.js'
  | '.commitlintrc.cjs'
  | '.commitlintrc.mjs'
  | '.commitlintrc.ts'
  | '.commitlintrc.cts'
  | 'commitlint.config.js'
  | 'commitlint.config.cjs'
  | 'commitlint.config.mjs'
  | 'commitlint.config.ts'
  | 'commitlint.config.cts';

/**
 * The normalized options passed to the generator.
 */
export interface NormalizedSchema extends CommitlintGeneratorSchema {
  libsDir: string;
  appsDir: string;
}
