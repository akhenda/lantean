import { join } from 'path';

import { addDependenciesToPackageJson, generateFiles, readProjectConfiguration, Tree, updateJson } from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';
import { JSONSchemaForESLintConfigurationFiles as ESLintConfig } from '@schemastore/package';

import { deps } from './constants';
import { LoggingGeneratorSchema, NormalizedSchema } from './schema';
import { normalizeOptions } from './utils';

import typesGenerator from '../types/generator';
import { normalizeOptions as normalizeTypesOptions } from '../types/utils';

import { updateTSConfigCompilerOptions } from '../../utils';

/**
 * Deletes unnecessary files from the specified library directory.
 *
 * This function removes the `src/index.ts` file and deletes all files
 * within the `src/lib` directory of the given library directory.
 *
 * @param tree The file system tree.
 * @param libDirectory The directory of the library where files will be deleted.
 */
function cleanupLib(tree: Tree, libDirectory: string) {
  tree.delete(`${libDirectory}/src/index.ts`);

  const libFiles = tree.children(`${libDirectory}/src/lib`);

  for (const file of libFiles) {
    tree.delete(`${libDirectory}/src/lib/${file}`);
  }
}

/**
 * Adds all necessary dependencies for the logging generator to the project.
 *
 * @param tree The file system tree.
 * @returns The updated dependencies.
 */
export function addDependencies(tree: Tree) {
  const dependencies: Record<string, string> = deps;
  const devDependencies: Record<string, string> = {};

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

/**
 * Generates the necessary files for the Logging library.
 *
 * This function uses a template to generate files within the specified
 * project root directory. It utilizes the provided options to configure
 * file generation, including npm scope and naming conventions.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
export function addLibFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = { ...options, template: '' };

  generateFiles(tree, join(__dirname, 'files'), options.projectRoot, templateOptions);
}

/**
 * Updates the TypeScript configuration files for the logging library.
 *
 * - Modifies the main `tsconfig.json` to set specific compiler options
 *   such as disabling property access from index signature warnings and enabling
 *   ES module interoperability.
 * - Updates the `tsconfig.lib.json` to include additional type definitions
 *   like `app.d.ts`.
 *
 * @param tree The file system tree.
 * @param options The normalized schema options.
 */
function updateTSConfigs(tree: Tree, options: NormalizedSchema) {
  updateJson<TSConfig>(tree, join(options.projectRoot, 'tsconfig.json'), (json) => {
    return updateTSConfigCompilerOptions(json, {
      noPropertyAccessFromIndexSignature: false,
      esModuleInterop: true,
    });
  });

  updateJson<TSConfig>(tree, join(options.projectRoot, 'tsconfig.lib.json'), (json) => {
    json.include = [...(json.include as string[]), 'app.d.ts'];

    return json;
  });
}

/**
 * Updates the ESLint configuration to ignore all dependencies listed in the
 * `deps` constant, as well as the types library import path and 'lodash'.
 *
 * This function takes a Tree and NormalizedSchema as arguments and modifies
 * the ESLint configuration file for the project in the tree with the given
 * options. It only updates the configuration if the ESLint configuration has
 * overrides and the overrides include a JSON file.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
function updateESLintConfig(tree: Tree, options: NormalizedSchema) {
  updateJson<ESLintConfig>(tree, join(options.projectRoot, '.eslintrc.json'), (json) => {
    if (json.overrides && json.overrides.length) {
      json.overrides.forEach((override) => {
        if (override.files && override.files.includes('*.json')) {
          override.rules['@nx/dependency-checks'] = [
            'error',
            { ignoredDependencies: [...Object.keys(deps), options.typesLibImportPath, 'lodash'] },
          ];
        }
      });
    }

    return json;
  });
}

/**
 * Generates a library for logging.
 *
 * This generator creates a new library with the given name and options,
 * and configures it to use ESlint and TypeScript. It also adds the necessary
 * dependencies and generates the necessary files.
 *
 * The generator first tries to read the configuration for the types library
 * with the given name from the workspace. If the configuration exists, it uses
 * the project root and import path from the configuration to generate the
 * logging library. If the configuration does not exist, the generator runs
 * the types generator with the given name and options, and uses the project
 * root and import path from the generated configuration to generate the
 * logging library.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param schema The options passed to the generator.
 */
export async function generateLoggingLib(tree: Tree, schema: LoggingGeneratorSchema) {
  let options: NormalizedSchema;

  const skipFormat = false;
  const { projectName: typesLibName, importPath: typesImportPath } = normalizeTypesOptions(tree, {
    name: schema.typesLibName,
    skipFormat,
  });

  try {
    const typesConfig = readProjectConfiguration(tree, typesLibName);

    if (typesConfig) {
      options = normalizeOptions(tree, schema, {
        projectName: typesLibName,
        importPath: typesImportPath,
      });
    }
  } catch (error) {
    const result = await typesGenerator(tree, { name: typesLibName, skipFormat });
    const { options: universalLibOptions } = result();

    options = normalizeOptions(tree, schema, universalLibOptions);
  }

  await libraryGenerator(tree, {
    compiler: 'tsc',
    directory: options.projectRoot,
    linter: 'eslint',
    name: options.projectName,
    projectNameAndRootFormat: 'as-provided',
    setParserOptionsProject: true,
    strict: true,
    tags: options.parsedTags.join(','),
    skipFormat,
  });

  cleanupLib(tree, options.projectRoot);
  addLibFiles(tree, options);
  updateTSConfigs(tree, options);
  updateESLintConfig(tree, options);
  addDependencies(tree);
}
