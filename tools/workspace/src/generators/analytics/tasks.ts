import { join } from 'path';

import { addDependenciesToPackageJson, generateFiles, Tree, updateJson } from '@nx/devkit';
import { addTsConfigPath, getRootTsConfigPathInTree, libraryGenerator } from '@nx/js';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';

import { deps } from './constants';
import { NormalizedSchema } from './schema';

import {
  getLibTSConfigExclude,
  getLibTSConfigInclude,
  eslintFlatConfigUpdateIgnoredDependencies,
  updateTSConfigCompilerOptions,
} from '../../utils';

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
      jsx: 'react-native',
    });
  });

  const folders = ['src'];

  updateJson<TSConfig>(tree, join(options.projectRoot, 'tsconfig.lib.json'), (json) => {
    json.include = [...getLibTSConfigInclude(folders, json.include)];
    json.exclude = getLibTSConfigExclude(folders, json.exclude);

    return json;
  });

  updateJson<TSConfig>(tree, join(options.projectRoot, 'tsconfig.spec.json'), (json) => {
    json.include = getLibTSConfigInclude(folders, json.include, ['spec.tsx', 'test.tsx']);

    return json;
  });
}

function updateESLintConfig(tree: Tree, options: NormalizedSchema) {
  const filePath = join(options.projectRoot, 'eslint.config.js');

  eslintFlatConfigUpdateIgnoredDependencies(tree, filePath, [...Object.keys(deps), options.loggingLibImportPath]);
}

function updateBaseTSConfigPaths(tree: Tree, options: NormalizedSchema) {
  updateJson<TSConfig>(tree, getRootTsConfigPathInTree(tree), (json) => {
    if (json.compilerOptions?.paths) delete json.compilerOptions.paths[options.importPath];

    return json;
  });

  addTsConfigPath(tree, `${options.importPath}/*`, [`${options.projectRoot}/*`]);
}

export async function generateAnalyticsLib(tree: Tree, options: NormalizedSchema) {
  await libraryGenerator(tree, {
    compiler: 'tsc',
    directory: options.projectRoot,
    linter: 'eslint',
    name: options.projectName,
    projectNameAndRootFormat: 'as-provided',
    setParserOptionsProject: true,
    strict: true,
    tags: options.parsedTags.join(','),
    skipFormat: options.skipFormat,
  });

  cleanupLib(tree, options.projectRoot);
  addLibFiles(tree, options);
  updateTSConfigs(tree, options);
  updateESLintConfig(tree, options);
  updateBaseTSConfigPaths(tree, options);
  addDependencies(tree);
}
