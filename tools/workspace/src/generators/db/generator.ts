import { formatFiles, installPackagesTask, readProjectConfiguration, Tree } from '@nx/devkit';

import { DbGeneratorSchema, NormalizedSchema } from './schema';
import { generateDBLib } from './tasks';
import { normalizeOptions } from './utils';

import loggingGenerator from '../logging/generator';
import { normalizeOptions as normalizeLoggingOptions } from '../logging/utils';
import { normalizeOptions as normalizeTypesOptions } from '../types/utils';


export async function dbGenerator(tree: Tree, schema: DbGeneratorSchema) {
  let options: NormalizedSchema;

  const skipFormat = false;
  const { projectName: typesLibName, importPath: typesImportPath } = normalizeTypesOptions(tree, {
    name: schema.typesLibName,
    skipFormat,
  });
  const { projectName: loggingLibName, importPath: loggingImportPath } = normalizeLoggingOptions(
    tree,
    {
      name: schema.loggingLibName,
      typesLibName,
      skipFormat,
    },
    {
      projectName: typesLibName,
      importPath: typesImportPath,
    },
  );

  try {
    const loggingConfig = readProjectConfiguration(tree, loggingLibName);

    if (loggingConfig) {
      options = normalizeOptions(tree, schema, {
        projectName: loggingLibName,
        importPath: loggingImportPath,
        typesLibName,
        typesLibImportPath: typesImportPath,
      });
    }
  } catch (error) {
    const result = await loggingGenerator(tree, { name: loggingLibName, typesLibName, skipFormat });
    const { options: loggingLibOptions } = result();

    options = normalizeOptions(tree, schema, loggingLibOptions);
  }

  await generateDBLib(tree, options);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);

    return { options };
  };
}

export default dbGenerator;
