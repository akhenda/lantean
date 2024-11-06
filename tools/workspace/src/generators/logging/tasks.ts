import { join } from 'path';

import { addDependenciesToPackageJson, generateFiles, readProjectConfiguration, Tree } from '@nx/devkit';
import { libraryGenerator } from '@nx/js';

import { deps } from './constants';
import { LoggingGeneratorSchema, NormalizedSchema } from './schema';
import { normalizeOptions } from './utils';

import typesGenerator from '../types/generator';
import { normalizeOptions as normalizeTypesOptions } from '../types/utils';

function cleanupLib(tree: Tree, libDirectory: string) {
  tree.delete(`${libDirectory}/src/index.ts`);

  const libFiles = tree.children(`${libDirectory}/src/lib`);

  for (const file of libFiles) {
    tree.delete(`${libDirectory}/src/lib/${file}`);
  }
}

export function addDependencies(tree: Tree) {
  const dependencies: Record<string, string> = deps;
  const devDependencies: Record<string, string> = {};

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

export function addLibFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = { ...options, template: '' };

  generateFiles(tree, join(__dirname, 'files'), options.projectRoot, templateOptions);
}

export async function generateLoggingLib(tree: Tree, schema: LoggingGeneratorSchema) {
  let options: NormalizedSchema;

  const skipFormat = false;
  const { projectName: typesLibName } = normalizeTypesOptions(tree, { name: schema.typesLibName, skipFormat });

  try {
    readProjectConfiguration(tree, typesLibName);
  } catch (error) {
    const result = await typesGenerator(tree, { name: typesLibName, skipFormat });
    const { options: universalLibOptions } = result();

    options = normalizeOptions(tree, schema, universalLibOptions);
  }

  await libraryGenerator(tree, {
    compiler: 'tsc',
    directory: options.projectRoot,
    linter: 'eslint',
    name: options.projectName,
    projectNameAndRootFormat: 'as-provided',
    setParserOptionsProject: true,
    strict: true,
    tags: options.parsedTags.join(','),
    skipFormat,
  });

  cleanupLib(tree, options.projectRoot);
  addLibFiles(tree, options);
  addDependencies(tree);
}
