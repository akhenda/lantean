import { join } from 'path';

import { addDependenciesToPackageJson, generateFiles, readProjectConfiguration, Tree, updateJson } from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';

import { deps } from './constants';
import { LoggingGeneratorSchema, NormalizedSchema } from './schema';
import { normalizeOptions } from './utils';

import typesGenerator from '../types/generator';
import { normalizeOptions as normalizeTypesOptions } from '../types/utils';

import { updateTSConfigCompilerOptions } from '../../utils';

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

function updateTSConfigs(tree: Tree, options: NormalizedSchema) {
  updateJson<TSConfig>(tree, join(options.projectRoot, 'tsconfig.json'), (json) => {
    return updateTSConfigCompilerOptions(json, {
      noPropertyAccessFromIndexSignature: false,
      esModuleInterop: true,
    });
  });

  updateJson<TSConfig>(tree, join(options.projectRoot, 'tsconfig.lib.json'), (json) => {
    json.include = [...(json.include as string[]), 'app.d.ts'];

    return json;
  });
}

export async function generateLoggingLib(tree: Tree, schema: LoggingGeneratorSchema) {
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
  updateTSConfigs(tree, options);
  addDependencies(tree);
}
