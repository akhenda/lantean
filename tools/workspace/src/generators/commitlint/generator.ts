import { formatFiles, Tree } from '@nx/devkit';

import { CommitlintGeneratorSchema } from './schema';
import {
  addDependencies,
  addFiles,
  updatePackageJson,
  updateReadme,
} from './tasks';
import { normalizeOptions } from './utils';

export async function commitlintGenerator(
  tree: Tree,
  schema: CommitlintGeneratorSchema,
) {
  const options = normalizeOptions(tree, schema);

  addDependencies(tree);
  updatePackageJson(tree);
  updateReadme(tree);
  addFiles(tree, options);

  await formatFiles(tree);
}

export default commitlintGenerator;
