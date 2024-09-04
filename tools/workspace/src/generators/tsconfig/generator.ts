import { formatFiles, readJson, Tree, writeJson } from '@nx/devkit';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';

import { lintWorkspaceTask } from '../../devkit';
import { updateTSConfigCompilerOptions } from '../../utils';

/**
 * Filename of tsconfig base file.
 */
export const tsConfigFile = 'tsconfig.base.json';

/**
 * Default tsconfig options.
 */
export const defaultTSConfig: TSConfig = {
  compilerOptions: {
    strict: true,
    strictNullChecks: true,
    forceConsistentCasingInFileNames: true,
    noImplicitAny: true,
    noImplicitReturns: true,
    noImplicitThis: true,
    noFallthroughCasesInSwitch: true,
  },
};

/**
 * Updates the base tsconfig.json file with stricter options.
 *
 * It adds the following options:
 * - forceConsistentCasingInFileNames: true
 * - noImplicitAny: true
 * - noImplicitReturns: true
 * - noImplicitThis: true
 * - noFallthroughCasesInSwitch: true
 * - strict: true
 *
 * @param tree The file system tree.
 * @returns True if the tsconfig.json file was found and updated.
 */
function setTsConfig(tree: Tree): boolean {
  if (!tree.exists(tsConfigFile)) {
    console.error(`File ${tsConfigFile} not found.`);

    return false;
  }

  let tsConfig = readJson<TSConfig>(tree, tsConfigFile);

  tsConfig = updateTSConfigCompilerOptions(
    tsConfig,
    defaultTSConfig.compilerOptions
  );
  writeJson(tree, tsConfigFile, tsConfig);

  return true;
}

/**
 * Sets up the base `tsconfig.json` file with stricter options.
 *
 * It generates a `tsconfig.base.json` file with the following options:
 * - `forceConsistentCasingInFileNames: true`
 * - `noImplicitAny: true`
 * - `noImplicitReturns: true`
 * - `noImplicitThis: true`
 * - `noFallthroughCasesInSwitch: true`
 * - `strict: true`
 *
 * If the file already exists, it will be overwritten.
 *
 * The task also formats the workspace after the generation.
 *
 * The returned function will lint the workspace when called.
 *
 * @param tree The file system tree.
 */
export async function tsconfigGenerator(tree: Tree) {
  if (!setTsConfig(tree)) return;

  await formatFiles(tree);

  return () => {
    lintWorkspaceTask(tree);
  };
}

export default tsconfigGenerator;
