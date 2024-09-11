import { join } from 'path';

import {
  addDependenciesToPackageJson,
  generateFiles,
  names,
  offsetFromRoot,
  Tree,
} from '@nx/devkit';
import { libraryGenerator } from '@nx/js';

import { getNpmScope } from '../../utils';

import { defaultLibName, envDeps } from './constants';
import { EnvGeneratorSchema, NormalizedSchema } from './schema';
import { normalizeOptions } from './utils';

export function addDependencies(tree: Tree) {
  const dependencies: Record<string, string> = envDeps;
  const devDependencies: Record<string, string> = {};

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

function updateJestConfig(tree: Tree, options: NormalizedSchema) {
  const filePath = join(options.projectRoot, 'jest.config.js');
  const fileEntry = tree.read(filePath);
  const contents = fileEntry?.toString() ?? '';

  const newContents = contents.replace(
    /moduleFileExtensions: \['ts', 'js', 'html'\],/gi,
    [
      "moduleFileExtensions: ['ts', 'js', 'html'],",
      "setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],",
    ].join('\n\t'),
  );

  // only write the file if something has changed
  if (newContents !== contents) tree.write(filePath, newContents);
}

export function addLibFiles(tree: Tree, options: NormalizedSchema) {
  const npmScope = getNpmScope(tree) ?? options.name;
  const templateOptions = {
    ...options,
    ...names(options.name),
    npmScope,
    npmScopeTitle: names(npmScope).className,
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };

  generateFiles(
    tree,
    join(__dirname, 'files'),
    options.projectRoot,
    templateOptions,
  );
}

export async function generateEnvLib(
  tree: Tree,
  options: EnvGeneratorSchema = { name: defaultLibName },
) {
  const normalizedOptions = normalizeOptions(tree, options);

  await libraryGenerator(tree, {
    compiler: 'tsc',
    directory: normalizedOptions.projectRoot,
    linter: 'eslint',
    name: normalizedOptions.projectName,
    projectNameAndRootFormat: 'as-provided',
    setParserOptionsProject: true,
    strict: true,
    tags: normalizedOptions.parsedTags.join(','),
  });

  addLibFiles(tree, normalizedOptions);
  updateJestConfig(tree, normalizedOptions);
  addDependencies(tree);
}
