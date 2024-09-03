import { CommitlintConfigFileName, CommitlintGeneratorSchema } from './schema';

/**
 * The normalized options passed to the generator.
 */
export interface NormalizedSchema extends CommitlintGeneratorSchema {
  libsDir: string;
  appsDir: string;
  fileName: CommitlintConfigFileName;
}
