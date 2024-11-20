import { CommitlintConfigFileName } from '../commitlint/schema';
import { LintStagedConfigFileName } from '../init/schema';

export interface SaasConvexGeneratorSchema {
  lintStagedConfigFileName: LintStagedConfigFileName;
  commitLintConfigFileName: CommitlintConfigFileName;
  envLibName: string;
  typesLibName: string;
  loggingLibName: string;
  monitoringLibName: string;
  analyticsLibName: string;
  dateLibName: string;
  emailLibName: string;
  jobsLibName: string;
  kvLibName: string;
  convexLibName: string;
  universalLibUIName: string;
  universalLibLibName: string;
  expoAppName: string;
  expoAppDisplayName: string;
  nextJSAppName: string;

  skipFormat?: boolean;
}

/**
 * The normalized options passed to the generator.
 */
export interface NormalizedSchema extends SaasConvexGeneratorSchema {
  /**
   * The path to the libs directory.
   */
  appsDir: string;

  /**
   * The path to the apps directory.
   */
  libsDir: string;
}
