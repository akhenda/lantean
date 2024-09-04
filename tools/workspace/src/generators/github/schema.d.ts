/**
 * Schema for the github generator.
 */
export interface GithubGeneratorSchema {
  /**
   * Base branch.
   */
  branch: string;

  /**
   * Configure CI workflow to use Nx Cloud.
   */
  useNxCloud: boolean;

  /**
   * Overwrites existing CI workflow.
   */
  force: boolean;

  /**
   * Package manager.
   */
  packageManager: 'bun' | 'npm' | 'pnpm';
}

/**
 * The normalized options passed to the generator.
 */
export interface NormalizedSchema extends GithubGeneratorSchema {
  libsDir: string;
  appsDir: string;
  gitRepo: string;
}
