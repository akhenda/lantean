import { getWorkspaceLayout, names, Tree } from '@nx/devkit';
import { NormalizedSchema } from './types';
import { LintingGeneratorSchema } from './schema';
import { eslintLibDirectory, eslintLibName, eslintLibTags } from './constants';

export function normalizeOptions(
  tree: Tree,
  options: LintingGeneratorSchema = {}
): NormalizedSchema {
  const name = names(eslintLibName).fileName;
  const projectDirectory = eslintLibDirectory
    ? `${names(eslintLibDirectory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).libsDir}/${projectDirectory}`;

  return {
    ...options,
    name: eslintLibName,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags: eslintLibTags,
  };
}
