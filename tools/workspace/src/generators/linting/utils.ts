import { getWorkspaceLayout, names, readJson, Tree } from '@nx/devkit';
import { NormalizedSchema } from './types';
import { LintingGeneratorSchema } from './schema';
import { eslintLibDirectory, eslintLibName, eslintLibTags } from './constants';

export function normalizeOptions(
  tree: Tree,
  options: LintingGeneratorSchema = {}
): NormalizedSchema {
  const layout = getWorkspaceLayout(tree);
  const name = names(eslintLibName).fileName;
  const project = names(eslintLibDirectory).fileName;
  const appsDir = layout.appsDir === '.' ? 'apps' : layout.appsDir;
  const libsDir = layout.libsDir === '.' ? 'libs' : layout.libsDir;
  const projectDirectory = eslintLibDirectory ? `${project}/${name}` : name;
  const projectRoot = `${libsDir}/${projectDirectory}`;

  return {
    ...options,
    name: eslintLibName,
    projectName: name,
    projectRoot,
    projectDirectory,
    parsedTags: eslintLibTags,
    appsDir,
    libsDir,
    importPath: getImportPath(tree, name),
  };
}

/**
 * Read the npm scope that a workspace should use by default
 */
export function getNpmScope(tree: Tree): string | undefined {
  const { name } = tree.exists('package.json')
    ? readJson<{ name?: string }>(tree, 'package.json')
    : { name: null };

  if (name?.startsWith('@')) return name.split('/')[0].substring(1);
}

/**
 * Prefixes project name with npm scope
 */
export function getImportPath(tree: Tree, projectDirectory: string): string {
  const npmScope = getNpmScope(tree);
  return npmScope
    ? `${npmScope === '@' ? '' : '@'}${npmScope}/${projectDirectory}`
    : projectDirectory;
}
