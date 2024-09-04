import { formatFiles, Tree } from '@nx/devkit';
import { GithubGeneratorSchema } from './schema';
import { normalizeOptions } from './utils';
import { addNxNamedInput, addScriptToPackageJson } from '../../devkit';
import { ciMergeWorkflowPath } from './constants';
import { addFiles, updateReadMe, useNXCloud } from './tasks';

export async function githubGenerator(
  tree: Tree,
  schema: GithubGeneratorSchema
) {
  const ciFile = ciMergeWorkflowPath;
  const options = normalizeOptions(tree, schema);

  if (!options.force && tree.exists(ciFile)) {
    console.log(`GitHub workflow already existing at path: ${ciFile}`);

    return;
  }

  useNXCloud(tree, options);
  addFiles(tree, options);
  addNxNamedInput(
    tree,
    { ci: ['{workspaceRoot}/.github/workflows/*.yml'] },
    true
  );
  addScriptToPackageJson(tree, 'nx', 'nx');

  updateReadMe(tree);

  await formatFiles(tree);
}

export default githubGenerator;
