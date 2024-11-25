import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { SaasDrizzleGeneratorSchema } from './schema';
import { generateSaaSDrizzleLib } from './tasks';
import { normalizeOptions } from './utils';

import loggingGenerator from '../logging/generator';
import initGenerator from '../init/generator';
import commitlintGenerator from '../commitlint/generator';
import lintingGenerator from '../linting/generator';
import tsconfigGenerator from '../tsconfig/generator';
import contributorsGenerator from '../contributors/generator';
import githubGenerator from '../github/generator';
import codecovGenerator from '../codecov/generator';
import envGenerator from '../env/generator';
import typesGenerator from '../types/generator';
import monitoringGenerator from '../monitoring/generator';
import analyticsGenerator from '../analytics/generator';
import dateGenerator from '../date/generator';
import emailGenerator from '../email/generator';
import kvGenerator from '../kv/generator';
import jobsGenerator from '../jobs/generator';
import drizzleGenerator from '../db/generator';
import universalGenerator from '../universal/generator';
import universalExpoGenerator from '../universal-expo/generator';
import universalNextGenerator from '../universal-next/generator';

export async function saasDrizzleGenerator(tree: Tree, schema: SaasDrizzleGeneratorSchema) {
  const skipFormat = false;
  const options = normalizeOptions(tree, { ...schema, skipFormat: schema.skipFormat ?? skipFormat });

  await initGenerator(tree, { configFileName: options.lintStagedConfigFileName });
  await commitlintGenerator(tree, { configFileName: options.commitLintConfigFileName });
  await lintingGenerator(tree, {
    lib: true,
    eslintRecommended: true,
    sonarJs: true,
    unusedImports: true,
    typescriptRecommended: true,
    deprecation: true,
    importOrder: true,
    prettier: true,
  });
  await tsconfigGenerator(tree);
  await contributorsGenerator(tree);
  await githubGenerator(tree);
  await codecovGenerator(tree);
  await envGenerator(tree);
  const typesGeneratorResult = await typesGenerator(tree, { name: options.typesLibName, skipFormat });

  const { options: typesLibOptions } = typesGeneratorResult();
  const { projectName: typesLibName } = typesLibOptions;

  const loggingGeneratorResult = await loggingGenerator(tree, {
    name: options.loggingLibName,
    typesLibName,
    skipFormat,
  });

  const { options: loggingLibOptions } = loggingGeneratorResult();
  const { projectName: loggingLibName } = loggingLibOptions;

  await monitoringGenerator(tree, { name: options.monitoringLibName, typesLibName, skipFormat });
  await analyticsGenerator(tree, { name: options.analyticsLibName, loggingLibName, typesLibName, skipFormat });
  await dateGenerator(tree, { name: options.dateLibName });
  await emailGenerator(tree, { name: options.emailLibName });
  await jobsGenerator(tree, { name: options.jobsLibName });
  await kvGenerator(tree, { name: options.kvLibName });
  await drizzleGenerator(tree, { name: options.drizzleLibName, loggingLibName, typesLibName, skipFormat });
  await universalGenerator(tree, {
    uiName: options.universalLibUIName,
    libName: options.universalLibLibName,
    skipFormat,
  });
  await universalExpoGenerator(tree, {
    name: options.expoAppName,
    displayName: options.expoAppDisplayName,
    uiName: options.universalLibUIName,
    libName: options.universalLibLibName,
  });
  await universalNextGenerator(tree, {
    name: options.nextJSAppName,
    uiName: options.universalLibUIName,
    libName: options.universalLibLibName,
  });

  await generateSaaSDrizzleLib(tree, options);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);

    return { options };
  };
}

export default saasDrizzleGenerator;
