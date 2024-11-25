import {
  detectPackageManager,
  ExecutorContext,
  getPackageManagerCommand,
  names,
  ProjectConfiguration,
  readJson,
  TargetConfiguration,
  Tree,
} from '@nx/devkit';
import { tsquery } from '@phenomnomnominal/tsquery';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';
import type { FlatESLintConfig } from 'eslint-define-config';
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
  { compileOnSave, compilerOptions = {}, extends: _extends = null, ...json }: TSConfig,
  options: TSConfig['compilerOptions'] = {},
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
  const { name } = tree.exists('package.json') ? readJson<{ name?: string }>(tree, 'package.json') : { name: null };

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
  return folders.map((directory) => exts.map((ext) => `${directory}/**/*.${ext}`)).flat();
}

/**
 * Creates a list of unique globs that can be used in a TSConfig's `include` field.
 *
 * @param globs The list of globs to include.
 * @param include The list of existing globs to include.
 *
 * @returns A list of unique globs.
 */
export function getTSConfigInclude(globs: string[] = [], include: string[] = []) {
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
export function getTSConfigExclude(globs: string[] = [], exclude: string[] = []) {
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
  extensions = ['ts', 'tsx'],
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
  extensions = ['spec.ts', 'spec.tsx', 'test.ts', 'test.tsx'],
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
  }[],
) {
  return additionalProjects.reduce<{
    [projectName: string]: ProjectConfiguration;
  }>(
    (acc, p) => {
      acc[p.project] = {
        root: p.projectRoot,
        targets: p.targets || {},
      };
      return acc;
    },
    {} satisfies { [project: string]: ProjectConfiguration },
  );
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
export const buildCommand = (parts: CommandPart[]): string => parts.filter(Boolean).join(' ');

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
  isDryRun = false,
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
 * Runs a command with the package manager. The package manager is determined
 * by the value of the `NX_COMMAND_USE_NPX` environment variable. If the
 * variable is set to `true`, the package manager is `npx`. Otherwise, the
 * package manager is determined by the value of the `npm_package_manager`
 * option in the `nx.json` file.
 *
 * @param command The command to run with the package manager.
 * @param options Options to run the command.
 * @param preCommand The parts of the command to run before the command.
 * @param postCommand The parts of the command to run after the command.
 * @returns The result of running the command. If `asString` is true, the result is
 * returned as a string. If `asJSON` is true, the result is returned as JSON. If
 * neither are true, the result is returned as an object with `success` and `output`
 * properties.
 */
export function execPackageManagerCommand(
  command: string,
  options?: CommandOptions,
  preCommand: string[] = [],
  postCommand: string[] = [],
) {
  return execCommand(
    buildCommand([
      ...preCommand,
      process.env.NX_COMMAND_USE_NPX ? 'npx' : getPackageManagerDlxCommand(),
      command,
      ...postCommand,
    ]),
    options,
  );
}

export function readNxVersion(tree: Tree): string {
  const packageJson = readJson(tree, 'package.json');

  const nxVersion = packageJson.devDependencies['@nx/workspace']
    ? packageJson.devDependencies['@nx/workspace']
    : packageJson.dependencies['@nx/workspace'];

  if (!nxVersion) throw new Error('@nx/workspace is not a dependency.');

  return nxVersion;
}

export function hasNxPackage(tree: Tree, nxPackage: string): boolean {
  const packageJson = readJson(tree, 'package.json');

  return (
    (packageJson.dependencies && packageJson.dependencies[nxPackage]) ||
    (packageJson.devDependencies && packageJson.devDependencies[nxPackage])
  );
}

/**
 * Updates the ESLint flat configuration file to include the specified list
 * of ignored dependencies.
 *
 * This function reads the contents of the specified file, updates the
 * `ignoredDependencies` array with the provided dependencies, and writes
 * the updated content back to the file only if changes are made.
 *
 * @param tree The file system tree representing the project structure.
 * @param filePath The path to the ESLint configuration file to update.
 * @param deps An array of dependencies to be added to the `ignoredDependencies` list.
 */
export function eslintFlatConfigUpdateIgnoredDependencies(tree: Tree, filePath: string, deps: string[]) {
  let newContents = '';
  const fileSource = tree.read(filePath);
  const contents = fileSource?.toString() ?? '';

  if (contents.includes('ignoredDependencies: [')) {
    newContents = contents.replace(
      /ignoredDependencies: \[/gi,
      ['ignoredDependencies: [', deps.map((dep) => `'${dep}'`).join(',\n')].join('\n\t'),
    );
  } else if (contents.includes('ignoredFiles: [')) {
    newContents = contents.replace(
      /ignoredFiles: \[/gi,
      ['ignoredDependencies: [\n\t', deps.map((dep) => `'${dep}'`).join(',\n\t'), '\n\t],', 'ignoredFiles: ['].join(
        '\n\t',
      ),
    );
  }

  // only write the file if something has changed
  if (newContents !== contents) tree.write(filePath, newContents);
}

/**
 * Updates the ESLint flat configuration file with the specified list
 * of rules.
 *
 * This function reads the contents of the specified file, updates the
 * `rules` object with the provided rules, and writes
 * the updated content back to the file only if changes are made.
 *
 * @param tree The file system tree representing the project structure.
 * @param filePath The path to the ESLint configuration file to update.
 * @param rules An array of ESLint rules to be added to the `rules` object.
 */
export function eslintFlatConfigAddGlobalRules(
  tree: Tree,
  filePath: string,
  rules: string[],
  files = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
) {
  const fileSource = tree.read(filePath);
  const contents = fileSource?.toString() ?? '';
  const newContents = contents.replace(
    /\];/gi,
    [
      '{',
      `files: ${JSON.stringify(files)},`,
      '// Override or add rules here',
      'rules: {',
      ...rules.map((rule) => `\t${rule},`),
      '},',
      '},',
      '];',
    ].join('\n\t'),
  );

  // only write the file if something has changed
  if (newContents !== contents) tree.write(filePath, newContents);
}

/**
 * Updates the ESLint flat configuration file with the specified list
 * of Prettier rules.
 *
 * This function reads the contents of the specified file, updates the
 * `rules` object with the provided rules, and writes
 * the updated content back to the file only if changes are made.
 *
 * @param tree The file system tree representing the project structure.
 * @param filePath The path to the ESLint configuration file to update.
 * @param rules An array of ESLint Prettier rules to be added to the `rules` object.
 */
export function eslintFlatConfigAddPrettierRules(tree: Tree, filePath: string, rules: string[]) {
  const fileSource = tree.read(filePath);
  const contents = fileSource?.toString() ?? '';
  const newContents = contents.replace(
    /\];/gi,
    [
      '...compat',
      '.config({',
      "extends: ['plugin:prettier/recommended'],",
      '})',
      '.map((config) => ({',
      '...config,',
      "files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.json', '**/*.html'],",
      'rules: {',
      ...rules.map((rule) => `\t${rule},`),
      '},',
      '})),',
      '];',
    ].join('\n\t'),
  );

  // only write the file if something has changed
  if (newContents !== contents) tree.write(filePath, newContents);
}

/**
 * Updates the ESLint flat configuration file with the specified list
 * of files to ignore.
 *
 * This function reads the contents of the specified file, updates the
 * list of ignored files with the provided files, and writes
 * the updated content back to the file only if changes are made.
 *
 * @param tree The file system tree representing the project structure.
 * @param filePath The path to the ESLint configuration file to update.
 * @param ignores An array of paths to be added to the list of ignored files.
 */
export function eslintFlatConfigUpdateIgnoreRules(tree: Tree, filePath: string, ignores: string[], atTheEnd = false) {
  const marker = '// -- More files to ignore go here --';
  const fileSource = tree.read(filePath);
  const contents = fileSource?.toString() ?? '';
  const newContents = atTheEnd
    ? contents.replace(
        '];',
        [
          '{',
          'ignores: [',
          ignores.map((ignore) => (ignore.includes('//') ? `\t${ignore}` : `\t'${ignore}',`)).join('\n\t'),
          marker,
          '],',
          '},',
          '];',
        ].join('\n\t'),
      )
    : contents.replace(marker, [ignores.map((ignore) => `\t'${ignore}',`).join('\n\t'), marker].join('\n\t'));

  // only write the file if something has changed
  if (newContents !== contents) tree.write(filePath, newContents);
}

/**
 * Updates the ESLint flat configuration file to extend the specified
 * configuration.
 *
 * This function reads the contents of the specified file, adds the import
 * statement for the specified configuration if it does not already exist,
 * and adds the specified configuration to the list of configurations to
 * extend at the specified location.
 *
 * @param tree The file system tree representing the project structure.
 * @param filePath The path to the ESLint configuration file to update.
 * @param importPath The path to the module that exports the configuration.
 * @param configName The name of the configuration to extend.
 * @param atTheEnd Whether to add the configuration at the end of the list.
 * Defaults to `true`. If `false`, adds the configuration at the beginning
 * of the list.
 */
export function eslintFlatConfigExtendAConfig(
  tree: Tree,
  filePath: string,
  importPath: string,
  configName: string,
  atTheEnd = true,
) {
  let newConfig: string;

  const config = tree.read(filePath).toString();
  const importedConfigName = `${configName}Config`;
  const newReqStmt = `const { ${configName}: ${importedConfigName} } = require('${importPath}');`;

  // Find existing import/require statements
  const reqStmts = tsquery(config, 'VariableStatement:has(CallExpression Identifier[name="require"])');

  // Check if the config is already imported; if not, insert the new import
  // after the last existing import
  if (!reqStmts.some((stmt) => stmt.getText().includes(importPath))) {
    const lastImport = reqStmts[reqStmts.length - 1];
    const end = lastImport.getEnd();

    newConfig = config.slice(0, end) + `\n${newReqStmt}` + config.slice(end);
  } else {
    newConfig = config; // No need to add the import if it exists
  }

  newConfig = atTheEnd
    ? newConfig.replace('];', [`...${importedConfigName},`, '];'].join('\n\t'))
    : newConfig.replace('module.exports = [', ['module.exports = [', `...${importedConfigName},`].join('\n\t'));

  // only write the file if something has changed
  if (newConfig !== config) tree.write(filePath, newConfig);
}

/**
 * Adds a plugin import statement to the ESLint configuration file if it is not already present.
 *
 * This function reads the contents of the specified ESLint configuration file, checks
 * whether the plugin is already imported, and adds an import statement for the plugin
 * using its npm package name if it is not present. The import statement is inserted
 * after the last existing import statement in the file.
 *
 * @param tree The file system tree representing the project structure.
 * @param filePath The path to the ESLint configuration file to update.
 * @param pluginName The name of the plugin to be imported.
 * @param npmName The npm package name of the plugin.
 * @returns The name of the plugin variable as it is imported.
 */
export function eslintFlatConfigAddPluginImport(
  tree: Tree,
  filePath: string,
  pluginName: string,
  npmName: string,
  doNotModifyPluginName = false,
) {
  let newConfig: string;

  const config = tree.read(filePath)?.toString() ?? '';
  const plugin = doNotModifyPluginName ? pluginName : `${names(pluginName.replace('@', '')).propertyName}Plugin`;
  const newReqStmt = `const ${plugin} = require('${npmName}');`;

  // Find existing import/require statements
  const reqStmts = tsquery(config, 'VariableStatement:has(CallExpression Identifier[name="require"])');

  // Check if plugin is already imported; if not, insert the new import
  // after the last existing import
  if (!reqStmts.some((stmt) => stmt.getText().includes(npmName))) {
    const lastImport = reqStmts[reqStmts.length - 1];
    const end = lastImport.getEnd();

    newConfig = config.slice(0, end) + `\n${newReqStmt}` + config.slice(end);
  } else {
    newConfig = config; // No need to add the import if it exists
  }

  // only write the file if something has changed
  if (newConfig !== config) tree.write(filePath, newConfig);

  return plugin;
}

/**
 * Adds a plugin to the ESLint configuration file if it is not already present.
 *
 * This function reads the contents of the specified ESLint configuration file,
 * checks whether the plugin is already imported, and adds an import statement
 * for the plugin using its npm package name if it is not present. It then adds
 * the specified plugin configuration to the list of configurations in the
 * file.
 *
 * @param tree The file system tree representing the project structure.
 * @param filePath The path to the ESLint configuration file to update.
 * @param pluginName The name of the plugin to be imported.
 * @param npmName The npm package name of the plugin.
 * @param pluginConfig The configuration string to be added for the plugin.
 * @param atTheEnd Whether to add the configuration at the end of the list.
 * Defaults to `true`. If `false`, adds the configuration at the beginning
 * of the list.
 */
export function eslintFlatConfigAddPlugin(
  tree: Tree,
  filePath: string,
  pluginName: string,
  npmName: string,
  pluginConfig: string,
  atTheEnd = true,
) {
  const plugin = eslintFlatConfigAddPluginImport(tree, filePath, pluginName, npmName);
  const config = tree.read(filePath)?.toString() ?? '';

  let newConfig = config;

  pluginConfig = pluginConfig.replaceAll('PLUGIN_IMPORT_REF', plugin);

  newConfig = atTheEnd
    ? newConfig.replace('];', [pluginConfig, '];'].join('\n\t'))
    : newConfig.replace('module.exports = [', ['module.exports = [', pluginConfig].join('\n\t'));

  // only write the file if something has changed
  if (newConfig !== config) tree.write(filePath, newConfig);
}

export function eslintFlatConfigUpdateParserOptions(tree: Tree, filePath: string, options: FlatESLintConfig) {
  const fileSource = tree.read(filePath);
  const contents = fileSource?.toString() ?? '';
  const newContents = contents.replace(/\];/gi, [JSON.stringify(options), '];'].join('\n\t'));

  // only write the file if something has changed
  if (newContents !== contents) tree.write(filePath, newContents);
}
