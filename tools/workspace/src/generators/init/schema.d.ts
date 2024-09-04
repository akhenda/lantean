/**
 * Name of the lint-staged config file.
 *
 * Ref: https://github.com/lint-staged/lint-staged#configuration
 */
export type LintStagedConfigFileName =
  | '.lintstagedrc'
  | '.lintstagedrc.json'
  | '.lintstagedrc.yaml'
  | '.lintstagedrc.yml'
  | '.lintstagedrc.js'
  | '.lintstagedrc.cjs'
  | '.lintstagedrc.mjs'
  | '.lintstagedrc.ts'
  | '.lintstagedrc.cts'
  | 'lint-staged.config.js'
  | 'lint-staged.config.cjs'
  | 'lint-staged.config.mjs'
  | 'lint-staged.config.ts'
  | 'lint-staged.config.cts';

/**
 * Schema for the init generator.
 */
export interface InitGeneratorSchema {
  configFileName: LintStagedConfigFileName;
}

/**
 * Normalized schema for the init generator.
 */
export interface NormalizedSchema extends InitGeneratorSchema {
  fileName: LintStagedConfigFileName;
}
