import { CommitlintConfigFileName, CommitlintGeneratorSchema } from './schema';

/**
 * The normalized options passed to the generator.
 */
export interface NormalizedSchema extends CommitlintGeneratorSchema {
  appsDir: string;
  fileName: CommitlintConfigFileName;
  gitRepo: string;
  libsDir: string;
}
