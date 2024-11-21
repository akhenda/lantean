import { getWorkspaceLayout, Tree } from '@nx/devkit';

import { NormalizedSchema, SaasDrizzleGeneratorSchema } from './schema';

import { normalizeOptions as normalizeInitOptions } from '../init/utils';
import { normalizeOptions as normalizeCommitlintOptions } from '../commitlint/utils';
import { normalizeOptions as normalizeEnvOptions } from '../env/utils';
import { normalizeOptions as normalizeTypesOptions } from '../types/utils';
import { normalizeOptions as normalizeLoggingOptions } from '../logging/utils';
import { normalizeOptions as normalizeMonitoringOptions } from '../monitoring/utils';
import { normalizeOptions as normalizeAnalyticsOptions } from '../analytics/utils';
import { normalizeOptions as normalizeDateOptions } from '../date/utils';
import { normalizeOptions as normalizeEmailOptions } from '../email/utils';
import { normalizeOptions as normalizeJobsOptions } from '../jobs/utils';
import { normalizeOptions as normalizeKVOptions } from '../kv/utils';
import { normalizeOptions as normalizeDrizzleOptions } from '../db/utils';
import { normalizeOptions as normalizeUniversalOptions } from '../universal/utils';
import { normalizeOptions as normalizeUniversalExpoOptions } from '../universal-expo/utils';
import { normalizeOptions as normalizeUniversalNextOptions } from '../universal-next/utils';
import { defaultUniversalLibLibName, defaultUniversalLibUIName } from './constants';

/**
 * Normalize options for the SaasDrizzle generator.
 *
 * @param tree The virtual file system tree.
 * @param options The options passed to the generator.
 * @returns The normalized options.
 *
 * The normalized options include the following:
 * - `appsDir`: The path to the apps directory.
 * - `libsDir`: The path to the libs directory.
 * - `lintStagedConfigFileName`: The file name for the lint-staged config file.
 * - `commitLintConfigFileName`: The file name for the commitlint config file.
 * - `envLibName`: The name of the env library.
 * - `typesLibName`: The name of the types library.
 * - `loggingLibName`: The name of the logging library.
 * - `monitoringLibName`: The name of the monitoring library.
 * - `analyticsLibName`: The name of the analytics library.
 * - `dateLibName`: The name of the date library.
 * - `emailLibName`: The name of the email library.
 * - `jobsLibName`: The name of the jobs library.
 * - `kvLibName`: The name of the KV library.
 * - `drizzleLibName`: The name of the Convex library.
 * - `universalLibUIName`: The name of the universal library for the UI.
 * - `universalLibLibName`: The name of the universal library for utils.
 * - `expoAppName`: The name of the Expo app.
 * - `expoAppDisplayName`: The display name of the Expo app.
 * - `nextJSAppName`: The name of the Next.js app.
 */
export function normalizeOptions(tree: Tree, { skipFormat, ...options }: SaasDrizzleGeneratorSchema): NormalizedSchema {
  const layout = getWorkspaceLayout(tree);
  const appsDir = layout.appsDir === '.' ? 'apps' : layout.appsDir;
  const libsDir = layout.libsDir === '.' ? 'libs' : layout.libsDir;

  const { fileName: lintStagedConfigFileName } = normalizeInitOptions({
    configFileName: options.lintStagedConfigFileName,
  });
  const { fileName: commitLintConfigFileName } = normalizeCommitlintOptions(tree, {
    configFileName: options.commitLintConfigFileName,
  });
  const { projectName: envLibName } = normalizeEnvOptions(tree, {
    name: options.envLibName,
  });
  const { projectName: typesLibName, importPath: typesLibImportPath } = normalizeTypesOptions(tree, {
    name: options.typesLibName,
  });
  const { projectName: loggingLibName, importPath: loggingLibImportPath } = normalizeLoggingOptions(
    tree,
    { name: options.loggingLibName, typesLibName, skipFormat },
    { projectName: typesLibName, importPath: typesLibImportPath },
  );
  const { projectName: monitoringLibName } = normalizeMonitoringOptions(
    tree,
    { name: options.monitoringLibName, typesLibName, skipFormat },
    { projectName: typesLibName, importPath: typesLibImportPath },
  );
  const { projectName: analyticsLibName } = normalizeAnalyticsOptions(
    tree,
    { name: options.analyticsLibName, typesLibName, skipFormat, loggingLibName },
    { projectName: loggingLibName, importPath: loggingLibImportPath, typesLibName, typesLibImportPath },
  );
  const { projectName: dateLibName } = normalizeDateOptions(tree, {
    name: options.dateLibName,
  });
  const { projectName: emailLibName } = normalizeEmailOptions(tree, {
    name: options.emailLibName,
  });
  const { projectName: jobsLibName } = normalizeJobsOptions(tree, {
    name: options.jobsLibName,
  });
  const { projectName: kvLibName } = normalizeKVOptions(tree, {
    name: options.kvLibName,
  });
  const { projectName: drizzleLibName } = normalizeDrizzleOptions(
    tree,
    { name: options.drizzleLibName },
    {
      projectName: loggingLibName,
      importPath: loggingLibImportPath,
      typesLibName,
      typesLibImportPath,
    },
  );
  const { uiName: universalLibUIName, libName: universalLibLibName } = normalizeUniversalOptions(tree, {
    uiName: options.universalLibUIName ?? defaultUniversalLibUIName,
    libName: options.universalLibLibName ?? defaultUniversalLibLibName,
    skipFormat,
  });
  const { projectName: expoAppName, displayName: expoAppDisplayName } = normalizeUniversalExpoOptions(tree, {
    name: options.expoAppName,
    displayName: options.expoAppDisplayName,
    uiName: universalLibUIName,
    libName: universalLibLibName,
  });
  const { projectName: nextJSAppName } = normalizeUniversalNextOptions(tree, {
    name: options.nextJSAppName,
    uiName: universalLibUIName,
    libName: universalLibLibName,
  });

  return {
    ...options,
    appsDir,
    libsDir,
    lintStagedConfigFileName,
    commitLintConfigFileName,
    envLibName,
    typesLibName,
    loggingLibName,
    monitoringLibName,
    analyticsLibName,
    dateLibName,
    emailLibName,
    jobsLibName,
    kvLibName,
    drizzleLibName,
    universalLibUIName,
    universalLibLibName,
    expoAppName,
    expoAppDisplayName,
    nextJSAppName,
  };
}
