import { join } from 'path';
import { generateFiles, names, offsetFromRoot, Tree } from '@nx/devkit';
import { libraryGenerator } from '@nx/js';

import { NormalizedSchema } from './types';
import { normalizeOptions } from './utils';

export function addLibFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };

  generateFiles(tree, join(__dirname, 'files'), options.projectRoot, templateOptions);
}

export async function generateConfigLib(tree: Tree, options: NormalizedSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  await libraryGenerator(tree, {
    name: normalizedOptions.projectName,
    js: true,
    compiler: 'tsc',
    projectNameAndRootFormat: 'as-provided',
    directory: normalizedOptions.projectRoot,
    setParserOptionsProject: true,
    linter: 'eslint',
    strict: true,
    tags: normalizedOptions.parsedTags.join(','),
  });
}
