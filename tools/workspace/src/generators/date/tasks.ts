import { join } from 'path';

import { addDependenciesToPackageJson, generateFiles, Tree, updateJson } from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';

import { deps } from './constants';
import { DateGeneratorSchema, NormalizedSchema } from './schema';
import { normalizeOptions } from './utils';

import { eslintFlatConfigUpdateIgnoredDependencies, updateTSConfigCompilerOptions } from '../../utils';

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
}

function updateESLintConfig(tree: Tree, options: NormalizedSchema) {
  const filePath = join(options.projectRoot, 'eslint.config.js');

  eslintFlatConfigUpdateIgnoredDependencies(tree, filePath, [...Object.keys(deps)]);
}

export async function generateDateLib(tree: Tree, schema: DateGeneratorSchema) {
  const skipFormat = false;
  const options = normalizeOptions(tree, schema);

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
  updateESLintConfig(tree, options);
  addDependencies(tree);
}
