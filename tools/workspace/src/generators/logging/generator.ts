import { formatFiles, installPackagesTask, readProjectConfiguration, Tree } from '@nx/devkit';

import { LoggingGeneratorSchema, NormalizedSchema } from './schema';
import { generateLoggingLib } from './tasks';
import { normalizeOptions } from './utils';

import typesGenerator from '../types/generator';
import { normalizeOptions as normalizeTypesOptions } from '../types/utils';

export async function loggingGenerator(tree: Tree, schema: LoggingGeneratorSchema) {
  let options: NormalizedSchema;

  const skipFormat = false;
  const { projectName: typesLibName, importPath: typesImportPath } = normalizeTypesOptions(tree, {
    name: schema.typesLibName,
    skipFormat,
  });

  try {
    const typesConfig = readProjectConfiguration(tree, typesLibName);

    if (typesConfig) {
      options = normalizeOptions(tree, schema, {
        projectName: typesLibName,
        importPath: typesImportPath,
      });
    }
  } catch (error) {
    const result = await typesGenerator(tree, { name: typesLibName, skipFormat });
    const { options: typesLibOptions } = result();

    options = normalizeOptions(tree, schema, typesLibOptions);
  }

  await generateLoggingLib(tree, options);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);

    return { options };
  };
}

export default loggingGenerator;
