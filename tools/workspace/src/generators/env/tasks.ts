import { join } from 'path';

import {
  addDependenciesToPackageJson,
  generateFiles,
  names,
  offsetFromRoot,
  readProjectConfiguration,
  Tree,
  updateJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';

import {
  getLibTSConfigExclude,
  getLibTSConfigInclude,
  getNpmScope,
  eslintFlatConfigUpdateIgnoredDependencies,
  updateTSConfigCompilerOptions,
} from '../../utils';

import { defaultLibName, envDeps } from './constants';
import { EnvGeneratorSchema, NormalizedSchema } from './schema';
import { normalizeOptions } from './utils';

/**
 * Adds all necessary dependencies for the env generator to the project.
 *
 * @param tree The file system tree.
 * @returns The updated dependencies.
 */
export function addDependencies(tree: Tree) {
  const dependencies: Record<string, string> = envDeps;
  const devDependencies: Record<string, string> = {};

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

/**
 * Updates the TSConfig files for the env project.
 *
 * - The main TSConfig is updated to use the `ESNext` module and
 *   `bundler` module resolution.
 * - The `tsconfig.lib.json` file is updated to include all `.ts` files in
 *   the `mobile`, `server`, and `web` directories, and to exclude all
 *   `.spec.ts` and `.test.ts` files.
 * - The `tsconfig.spec.json` file is updated to include all `.test.ts` and
 *   `.spec.ts` files in the `mobile`, `server`, and `web` directories, and to
 *   use the `ESNext` module.
 *
 * @param tree The file system tree.
 * @param options The normalized schema options.
 */
function updateTSConfigs(tree: Tree, options: NormalizedSchema) {
  const folders = ['mobile', 'server', 'web'];

  updateJson<TSConfig>(
    tree,
    join(options.projectRoot, 'tsconfig.json'),
    (json) => {
      return updateTSConfigCompilerOptions(json, {
        module: 'ESNext',
        moduleResolution: 'bundler',
        noPropertyAccessFromIndexSignature: false,
        esModuleInterop: true,
      });
    }
  );

  updateJson<TSConfig>(
    tree,
    join(options.projectRoot, 'tsconfig.lib.json'),
    (json) => {
      json.include = [
        ...getLibTSConfigInclude(folders, json.include, ['ts']),
        './index.ts',
        './utils.ts',
      ];
      json.exclude = getLibTSConfigExclude(folders, json.exclude, [
        'spec.ts',
        'test.ts',
      ]);

      return json;
    }
  );

  updateJson<TSConfig>(
    tree,
    join(options.projectRoot, 'tsconfig.spec.json'),
    (json) => {
      json.include = [
        ...getLibTSConfigInclude(folders, json.include, [
          'd.ts',
          'spec.ts',
          'test.ts',
        ]),
        'test-setup.ts',
      ];

      return updateTSConfigCompilerOptions(json, { module: 'ESNext' });
    }
  );
}

/**
 * Updates the Jest configuration file to include `test-setup.ts`.
 *
 * This is necessary for the `@nx/web` plugin to work correctly, as it
 * sets up the DOM environment for the tests.
 *
 * @param tree The file system tree.
 * @param options The normalized options for the generator.
 */
function updateJestConfig(tree: Tree, options: NormalizedSchema) {
  const filePath = join(options.projectRoot, 'jest.config.ts');
  const fileEntry = tree.read(filePath);
  const contents = fileEntry?.toString() ?? '';

  const newContents = contents.replace(
    /moduleFileExtensions: \['ts', 'js', 'html'\],/gi,
    [
      "moduleFileExtensions: ['ts', 'js', 'html'],",
      "setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],",
    ].join('\n\t')
  );

  // only write the file if something has changed
  if (newContents !== contents) tree.write(filePath, newContents);
}

/**
 * Generates the files for the environment library.
 *
 * This is a separate function from the main generator so that it can be
 * reused in the update generator.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
export function addLibFiles(tree: Tree, options: NormalizedSchema) {
  const npmScope = getNpmScope(tree) ?? options.name;
  const templateOptions = {
    ...options,
    ...names(options.name),
    npmScope,
    npmScopeTitle: names(npmScope).className,
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };

  generateFiles(
    tree,
    join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );

  tree.delete(join(options.projectRoot, 'src'));
}

function updateESLintConfig(tree: Tree, options: NormalizedSchema) {
  const filePath = join(options.projectRoot, 'eslint.config.js');

  eslintFlatConfigUpdateIgnoredDependencies(tree, filePath, ['@t3-oss/env-core', 'zod']);
}

function updatePackageJson(tree: Tree, options: NormalizedSchema) {
  updateJson(tree, join(options.projectRoot, 'package.json'), (json) => {
    json.main = './index.js';
    json.typings = './index.d.ts';

    return json;
  });
}

function updateProjectJson(tree: Tree, options: NormalizedSchema) {
  const project = readProjectConfiguration(tree, options.projectName);

  project.sourceRoot = options.projectRoot;

  project.targets = {
    ...project.targets,
    build: {
      ...project.targets.build,
      options: {
        ...project.targets.build.options,
        main: `${options.projectRoot}/index.ts`,
      },
    },
    test: {
      executor: '@nx/jest:jest',
      ...project.targets.test,
      options: {
        jestConfig: `${options.projectRoot}/jest.config.ts`,
        ...(project.targets.test?.options ?? {}),
        passWithNoTests: true,
      },
    },
  };

  updateProjectConfiguration(tree, options.projectName, project);

  // updateJson(tree, join(options.projectRoot, 'project.json'), (json) => {
  //   json.sourceRoot = options.projectRoot;

  //   if (json.targets?.build?.options) {
  //     json.targets.build.options.main = `${options.projectRoot}/index.ts`;
  //   }

  //   return json;
  // });
}

/**
 * Generates a dedicated Env library.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
export async function generateEnvLib(
  tree: Tree,
  options: EnvGeneratorSchema = { name: defaultLibName }
) {
  const normalizedOptions = normalizeOptions(tree, options);

  await libraryGenerator(tree, {
    compiler: 'tsc',
    directory: normalizedOptions.projectRoot,
    linter: 'eslint',
    name: normalizedOptions.projectName,
    projectNameAndRootFormat: 'as-provided',
    setParserOptionsProject: true,
    strict: true,
    tags: normalizedOptions.parsedTags.join(','),
  });

  addLibFiles(tree, normalizedOptions);
  updateJestConfig(tree, normalizedOptions);
  updateTSConfigs(tree, normalizedOptions);
  addDependencies(tree);
  updateESLintConfig(tree, normalizedOptions);
  updatePackageJson(tree, normalizedOptions);
  updateProjectJson(tree, normalizedOptions);
}
