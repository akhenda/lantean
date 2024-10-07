import {
  detectPackageManager,
  ExecutorContext,
  getPackageManagerCommand,
  ProjectConfiguration,
  readJson,
  TargetConfiguration,
  Tree,
} from '@nx/devkit';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';
import * as shell from 'shelljs';
import type { ExecOptions } from 'shelljs';

import { readPackageJson } from './devkit';

/**
 * Reads the root `package.json` file from the given tree.
 *
 * @param tree The file system tree.
 * @returns The parsed content of the `package.json` file, or an empty object
 * if it does not exist.
 */
export function getPkgJson(tree: Tree) {
  return readPackageJson(tree);
}

/**
 * Retrieves the version of Nx installed in the workspace.
 *
 * @param tree The file system tree.
 *
 * @returns The version of Nx installed in the workspace, or '19.6.4' if it is
 * not installed.
 */
export function getNXVersion(tree: Tree) {
  return getPkgJson(tree).devDependencies?.nx ?? '19.6.4';
}

/**
 * Checks if Husky is installed in a workspace.
 *
 * @param tree The file system tree.
 *
 * @returns True if Husky is installed, false otherwise.
 */
export function isHuskyInstalled(tree: Tree) {
  return !!getPkgJson(tree)?.devDependencies?.husky;
}

/**
 * Updates the `compilerOptions` of a TSConfig with the provided options.
 *
 * Preserves the existing `baseUrl` and `paths` options.
 *
 * @param config The TSConfig to update.
 * @param options The options to update `compilerOptions` with.
 * @returns The updated TSConfig.
 */
export function updateTSConfigCompilerOptions(
  {
    compileOnSave,
    compilerOptions = {},
    extends: _extends = null,
    ...json
  }: TSConfig,
  options: TSConfig['compilerOptions'] = {}
) {
  const { baseUrl, paths, ...defaultCompilerOptions } = compilerOptions;

  return {
    ...(_extends ? { extends: _extends } : {}),
    compileOnSave,
    compilerOptions: { ...defaultCompilerOptions, ...options, baseUrl, paths },
    ...json,
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

  return '';
}

/**
 * Prefixes project name with npm scope
 */
export function getImportPath(tree: Tree, dir: string): string {
  const npmScope = getNpmScope(tree);
  const prefix = npmScope === '@' ? '' : '@';

  return npmScope ? `${prefix}${npmScope}/${dir}` : dir;
}

/**
 * Creates an array of globs that can be used in a TSConfig's `include` field.
 *
 * @param folders The folders to create globs for.
 * @param exts The file extensions to include.
 *
 * @returns An array of globs.
 */
export function getTSConfigGlobs(folders: string[] = [], exts: string[] = []) {
  return folders
    .map((directory) => exts.map((ext) => `${directory}/**/*.${ext}`))
    .flat();
}

/**
 * Creates a list of unique globs that can be used in a TSConfig's `include` field.
 *
 * @param globs The list of globs to include.
 * @param include The list of existing globs to include.
 *
 * @returns A list of unique globs.
 */
export function getTSConfigInclude(
  globs: string[] = [],
  include: string[] = []
) {
  return Array.from(new Set([...include, ...globs]));
}

/**
 * Creates a list of unique globs that can be used in a TSConfig's `exclude` field.
 *
 * @param globs The list of globs to exclude.
 * @param exclude The list of existing globs to exclude.
 *
 * @returns A list of unique globs.
 */
export function getTSConfigExclude(
  globs: string[] = [],
  exclude: string[] = []
) {
  return Array.from(new Set([...exclude, ...globs]));
}

/**
 * Creates a list of unique globs that can be used in a library's TSConfig's `include` field.
 *
 * @param folders The list of folders to include.
 * @param include The list of existing globs to include.
 * @param extensions The list of file extensions to include.
 *
 * @returns A list of unique globs.
 */
export function getLibTSConfigInclude(
  folders: string[] = [],
  include: TSConfig['include'] = [],
  extensions = ['ts', 'tsx']
) {
  const globs = getTSConfigGlobs(folders, extensions);

  return getTSConfigInclude(globs, include as Array<string>);
}

/**
 * Creates a list of unique globs that can be used in a library's TSConfig's `exclude` field.
 *
 * @param folders The list of folders to exclude.
 * @param exclude The list of existing globs to exclude.
 * @param extensions The list of file extensions to exclude.
 *
 * @returns A list of unique globs.
 */
export function getLibTSConfigExclude(
  folders: string[] = [],
  exclude: TSConfig['exclude'] = [],
  extensions = ['spec.ts', 'spec.tsx', 'test.ts', 'test.tsx']
) {
  const globs = getTSConfigGlobs(folders, extensions);

  return getTSConfigInclude(globs, exclude as Array<string>);
}

/**
 * Assembles the given list of additional projects into a map of project
 * configurations.
 *
 * @param additionalProjects The list of additional projects to assemble.
 * @returns A map of project configurations, where each key is the project name
 * and the value is the project configuration.
 */
function assembleAdditionalProjects(
  additionalProjects: {
    project: string;
    projectRoot: string;
    targets?: Record<string, TargetConfiguration>;
  }[]
) {
  return additionalProjects.reduce<{
    [projectName: string]: ProjectConfiguration;
  }>((acc, p) => {
    acc[p.project] = {
      root: p.projectRoot,
      targets: p.targets || {},
    };
    return acc;
  }, {} satisfies { [project: string]: ProjectConfiguration });
}

/**
 * Creates a fake Nx ExecutorContext for testing purposes.
 *
 * @param options The options for creating the fake context.
 * @param options.cwd The current working directory of the context.
 * @param options.project The name of the project.
 * @param options.projectRoot The path to the root of the project.
 * @param options.workspaceRoot The path to the root of the workspace.
 * @param options.targets The targets of the project.
 * @param options.additionalProjects The additional projects to include in the context.
 * @returns The fake context.
 */
export function createFakeContext({
  cwd = process.cwd(),
  project,
  projectRoot,
  workspaceRoot,
  targets = {},
  additionalProjects = [],
}: {
  cwd?: string;
  project: string;
  projectRoot: string;
  workspaceRoot: string;
  targets?: Record<string, TargetConfiguration>;
  additionalProjects?: {
    project: string;
    projectRoot: string;
    targets?: Record<string, TargetConfiguration>;
  }[];
}): ExecutorContext {
  const projectsConfigurations = {
    version: 2,
    projects: {
      [project]: { root: projectRoot, targets },
      ...assembleAdditionalProjects(additionalProjects),
    },
  };

  return {
    isVerbose: false,
    cwd: cwd,
    root: workspaceRoot,
    projectName: project,
    projectsConfigurations,
    projectGraph: { nodes: {}, dependencies: {} },
    workspace: projectsConfigurations,
  } satisfies ExecutorContext;
}

/**
 * Represents a part of a command. A part can be a string or a boolean
 * (indicating that the part should not be included in the command).
 */
type CommandPart = string | boolean;

/**
 * Options to run a command.
 */
export interface CommandOptions extends ExecOptions {
  asString?: boolean;
  asJSON?: boolean;
  silent?: boolean;
}

/**
 * Builds a command from a list of parts.
 *
 * @param parts The parts of the command to build.
 * @returns The built command.
 *
 * @example
 * buildCommand(['npm', 'install', '--save-dev', 'jest'])
 * > 'npm install --save-dev jest'
 */
export const buildCommand = (parts: CommandPart[]): string =>
  parts.filter(Boolean).join(' ');

/**
 * Returns the `dlx` command of the detected package manager.
 *
 * @returns The `dlx` command of the detected package manager.
 */
export function getPackageManagerDlxCommand() {
  return getPackageManagerCommand(detectPackageManager()).dlx;
}

/**
 * Runs a command.
 *
 * @param command The command to run.
 * @param options Options to run the command.
 * @param isDryRun If true, the command is not actually run and success is returned.
 * @returns The result of running the command. If `asString` is true, the result is returned
 * as a string. If `asJSON` is true, the result is returned as JSON. If neither are true,
 * the result is returned as an object with `success` and `output` properties.
 *
 * @example
 * execCommand('npm install jest --save-dev')
 * > { success: true, output: '' }
 *
 * @example
 * execCommand('npm install jest --save-dev', { asString: true })
 * > 'jest@^28.1.3 installed'
 *
 * @example
 * execCommand('npm install jest --save-dev', { asJSON: true })
 * > { "success": true, "output": "" }
 */
export const execCommand = (
  command: string,
  options: CommandOptions = { asString: false, asJSON: false },
  isDryRun = false
) => {
  if (!options.silent || isDryRun) {
    console.log('\nRunning:');
    console.log(command);

    if (isDryRun) return { success: true, output: '' };
  }

  const result = shell.exec(command, options);

  if (options.asJSON) return JSON.parse(result.toString());
  if (options.asString) return result.toString();

  return { success: result['code'] === 0, output: result.stdout };
};

/**
 * Run a command using the workspace's package manager.
 *
 * If the `NX_COMMAND_USE_NPX` environment variable is set, the command is
 * run using `npx`. Otherwise, the command is run using the package manager's
 * `dlx` command.
 *
 * @param command The command to run.
 * @param options Options to pass to the command. If `asString` is true, the
 * result is returned as a string. If `asJSON` is true, the result is returned as
 * JSON. If neither are true, the result is returned as an object with `success`
 * and `output` properties.
 *
 * @example
 * execPackageManagerCommand('install jest --save-dev')
 * > { success: true, output: '' }
 *
 * @example
 * execPackageManagerCommand('install jest --save-dev', { asString: true })
 * > 'jest@^28.1.3 installed'
 *
 * @example
 * execPackageManagerCommand('install jest --save-dev', { asJSON: true })
 * > { "success": true, "output": "" }
 */
export function execPackageManagerCommand(
  command: string,
  options?: CommandOptions,
  env = ''
) {
  return execCommand(
    buildCommand([
      env,
      process.env.NX_COMMAND_USE_NPX ? 'npx' : getPackageManagerDlxCommand(),
      command,
    ]),
    options
  );
}
