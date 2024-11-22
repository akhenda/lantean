import { getWorkspaceLayout, names, Tree, updateJson } from '@nx/devkit';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';

import { getImportPath, updateTSConfigCompilerOptions } from '../../utils';

import { eslintIgnores, eslintLibDirectory, eslintLibName, eslintLibTags } from './constants';
import { NormalizedSchema, SheriffGeneratorSchema } from './schema';

/**
 * Normalize options for the ESLint generator.
 *
 * @param tree The virtual file system tree.
 * @param options The options passed to the generator.
 * @returns The normalized options.
 *
 * The normalized options include the following:
 * - `name`: The name of the ESLint config library.
 * - `projectName`: The name of the project.
 * - `projectRoot`: The path to the project root.
 * - `projectDirectory`: The path to the project directory.
 * - `parsedTags`: The parsed tags for the project.
 * - `appsDir`: The path to the apps directory.
 * - `libsDir`: The path to the libs directory.
 * - `importPath`: The import path for the ESLint config library.
 */
export function normalizeOptions(tree: Tree, options: SheriffGeneratorSchema = {}): NormalizedSchema {
  const layout = getWorkspaceLayout(tree);
  const name = names(eslintLibName).fileName;
  const project = names(eslintLibDirectory).fileName;
  const appsDir = layout.appsDir === '.' ? 'apps' : layout.appsDir;
  const libsDir = layout.libsDir === '.' ? 'libs' : layout.libsDir;
  const projectDirectory = `${project}/${name}`;
  const projectRoot = `${libsDir}/${projectDirectory}`;
  const importPath = getImportPath(tree, name);

  return {
    ...options,
    appsDir,
    importPath,
    libsDir,
    name: eslintLibName,
    parsedTags: eslintLibTags,
    projectDirectory,
    projectName: name,
    projectRoot,
  };
}

/**
 * Updates the base TSConfig.
 *
 * - Enables strictNullChecks in the base TSConfig.
 *
 * @param tree The virtual file system tree.
 * @param options The normalized schema options.
 */
export function updateBaseTSConfig(tree: Tree) {
  updateJson<TSConfig>(tree, 'tsconfig.base.json', (json) => {
    return updateTSConfigCompilerOptions(json, { strictNullChecks: true });
  });
}

export function getESLintIgnores(tree: Tree, options: NormalizedSchema) {
  return [
    `// ${getImportPath(tree, options.projectDirectory)}`,
    ...eslintIgnores,
    '// The eslint config test fixtures contain files that deliberatly fail linting',
    "// in order to tests that the config reports those errors. We don't want the",
    '// normal eslint run to complain about those files though so ignore them here.',
    `"${options.projectRoot}/src/tests/fixtures",`,
    `"${options.projectRoot}/src/**/*/fixtures",`,
    '"**/*/fixtures",',
  ];
}
