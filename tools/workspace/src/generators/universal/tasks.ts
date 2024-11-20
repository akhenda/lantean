import { join } from 'path';

import {
  addDependenciesToPackageJson,
  generateFiles,
  offsetFromRoot,
  readJson,
  readProjectConfiguration,
  Tree,
  updateJson,
  updateProjectConfiguration,
  writeJson,
} from '@nx/devkit';
import { SchemaForPrettierrc } from '@schemastore/prettierrc';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';
import { addTsConfigPath, libraryGenerator } from '@nx/js';
import { unique } from 'radash';

import {
  dependencies,
  devDependencies,
  folderNames,
  vscodeExtensions,
} from './constants';
import { NormalizedSchema } from './schema';
import {
  buildCommand,
  execCommand,
  getLibTSConfigExclude,
  getLibTSConfigInclude,
  updateTSConfigCompilerOptions,
} from '../../utils';

/**
 * Deletes unnecessary files from the library.
 *
 * The library is created by `@nx/js` and contains unnecessary
 * files such as `package.json` and `src/index.ts` that need to be deleted.
 *
 * @param tree The file system tree.
 * @param libDirectory The directory of the library.
 */
function cleanupLib(tree: Tree, libDirectory: string) {
  tree.delete(`${libDirectory}/package.json`);
  tree.delete(`${libDirectory}/src/index.ts`);

  const libFiles = tree.children(`${libDirectory}/src/lib`);

  for (const file of libFiles) {
    tree.delete(`${libDirectory}/src/lib/${file}`);
  }
}

/**
 * Updates the TSConfig paths for the universal library.
 *
 * The paths are updated to include the paths for the design, features,
 * core directories.
 *
 * @param tree The file system tree.
 * @param options The normalized options for the generator.
 */
function updateBaseTSConfigPaths(tree: Tree, options: NormalizedSchema) {
  const { designUI: ui, designLib } = options.folderNames;
  const { design, features, core } = options.paths;

  addTsConfigPath(tree, `${core.path}/*`, [`${core.root}/*`]);
  addTsConfigPath(tree, `${features.path}/*`, [`${features.root}/*`]);
  addTsConfigPath(tree, `${design.path}/${ui}/*`, [`${design.root}/${ui}/*`]);
  addTsConfigPath(tree, `${design.path}/${designLib}/*`, [
    `${design.root}/${designLib}/*`,
  ]);
}

/**
 * Generates the files for the universal library.
 *
 * This is a separate function from the main generator so that it can be
 * reused in the update generator.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
function addLibFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };

  generateFiles(
    tree,
    join(__dirname, 'files'),
    options.projectRoot,
    templateOptions,
  );
}

/**
 * Generates the `components.json` file for the universal library.
 *
 * This file is used by the `react-native-reusables` package to configure the
 * universal library.
 *
 * The file is only generated if it does not already exist.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
function addComponentsJson(tree: Tree, options: NormalizedSchema) {
  const componentsJsonPath = join(options.projectRoot, 'components.json');

  if (!tree.exists(componentsJsonPath)) {
    const { design } = options.paths;
    const { designUI: ui, designLib: lib } = options.folderNames;

    writeJson(tree, componentsJsonPath, {
      aliases: {
        components: `${design.path}/${ui}/components`,
        lib: `libs/${options.projectName}/design/${lib}`,
      },
    });
  }
}

/**
 * Updates the project configuration to include the necessary targets
 * for generating new components, pages, and utilities in the universal library.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
function updateProjectConfig(
  tree: Tree,
  { npmScope, projectName, projectRoot }: NormalizedSchema,
) {
  updateProjectConfiguration(tree, projectName, {
    ...readProjectConfiguration(tree, projectName),
    sourceRoot: projectRoot,
    targets: {
      'add-component': {
        executor: `@${npmScope}/workspace:add-universal-component`,
        options: { projectRoot },
      },
      'add-page': {
        executor: `@${npmScope}/workspace:add-universal-page`,
      },
      'add-util': {
        executor: `@${npmScope}/workspace:add-universal-util`,
      },
    },
  });
}

/**
 * Updates the TSConfig files for the universal library.
 *
 * - The main TSConfig is updated to use the `ESNext` module and
 *   `bundler` module resolution.
 * - The `tsconfig.lib.json` file is updated to include all `.ts` files in
 *   the `design`, `features`, `core`, `providers`, `stores`, and `utils`
 *   directories, and to exclude all `.spec.ts` and `.test.ts` files.
 * - The `tsconfig.spec.json` file is updated to include all `.test.ts` and
 *   `.spec.ts` files in the `design`, `features`, `core`, `providers`,
 *   `stores`, and `utils` directories, and to use the `ESNext` module.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized schema options.
 */
function updateTSConfigs(tree: Tree, options: NormalizedSchema) {
  const folders = Object.values(folderNames);

  updateJson<TSConfig>(
    tree,
    join(options.projectRoot, 'tsconfig.json'),
    (json) => {
      return updateTSConfigCompilerOptions(json, {
        noPropertyAccessFromIndexSignature: false,
        esModuleInterop: true,
        jsx: 'react-native',
      });
    },
  );

  updateJson<TSConfig>(
    tree,
    join(options.projectRoot, 'tsconfig.lib.json'),
    (json) => {
      json.include = [
        'nativewind-env.d.ts',
        ...getLibTSConfigInclude(folders, json.include),
      ];
      json.exclude = getLibTSConfigExclude(folders, json.exclude);

      return json;
    },
  );

  updateJson<TSConfig>(
    tree,
    join(options.projectRoot, 'tsconfig.spec.json'),
    (json) => {
      json.include = getLibTSConfigInclude(folders, json.include, [
        'd.ts',
        'spec.ts',
        'spec.tsx',
        'test.ts',
        'test.tsx',
      ]);

      return json;
    },
  );
}

/**
 * Updates VSCode settings to include Tailwind CSS and its VSCode extensions.
 *
 * It creates `.vscode/settings.json` and `.vscode/extensions.json` files if
 * they don't exist, and updates their contents if they do.
 *
 * The `tailwindCSS.experimental.classRegex` setting is set to allow Tailwind
 * CSS classes to be used in `.mjs` files.
 *
 * @param tree The abstract syntax tree of the workspace.
 */
function updateVSCodeSettings(tree: Tree) {
  const extensionsFilePath = join('.vscode', 'extensions.json');

  if (tree.exists(extensionsFilePath)) {
    updateJson(tree, extensionsFilePath, (extensionsJson) => {
      return {
        ...extensionsJson,
        recommendations: unique([
          ...extensionsJson.recommendations,
          ...vscodeExtensions,
        ]),
      };
    });
  } else {
    writeJson(tree, extensionsFilePath, { recommendations: vscodeExtensions });
  }

  updateJson(tree, join('.vscode', 'settings.json'), (settingsJson) => {
    return {
      ...settingsJson,

      'files.associations': { '*.css': 'tailwindcss' },
      'tailwindCSS.experimental.classRegex': [
        ['tva\\((([^()]*|\\([^()]*\\))*)\\)', '["\'`]([^"\'`]*).*?["\'`]'],
      ],
    };
  });
}

/**
 * Adds dependencies to `package.json`.
 *
 * @param tree The file system tree.
 */
function addDependencies(tree: Tree) {
  addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

/**
 * Updates the root `.prettierrc` configuration file to include
 * the `prettier-plugin-tailwindcss` plugin.
 *
 * If the file does not exist, it creates it with an empty configuration.
 *
 * Otherwise, it adds the plugin to the existing configuration.
 *
 * @param tree The abstract syntax tree of the workspace.
 */
export function updatePrettierConfig(tree: Tree) {
  const prettierConfigFile = '.prettierrc';

  if (!tree.exists(prettierConfigFile) && !tree.exists('.prettierrc.json')) {
    writeJson(tree, prettierConfigFile, {});
  }

  let prettierConfig = readJson<Exclude<SchemaForPrettierrc, string>>(
    tree,
    prettierConfigFile,
  );

  prettierConfig = {
    ...prettierConfig,
    plugins: [...(prettierConfig.plugins ?? []), 'prettier-plugin-tailwindcss'],
    tailwindFunctions: ['tva'],
  };

  writeJson(tree, prettierConfigFile, prettierConfig);
}

/**
 * Updates the root `package.json` to include the necessary scripts for the
 * generator.
 *
 * Adds the `universal:component:add` script which allows users to easily add
 * components to their universal project.
 *
 * @param tree The file system tree.
 */
function updatePackageJsons(tree: Tree) {
  updateJson(tree, 'package.json', (packageJson) => {
    /* eslint-disable @typescript-eslint/naming-convention */
    packageJson.scripts = {
      ...(packageJson.scripts ?? {}),
      'universal:component:add':
        'TS_NODE_PROJECT=tsconfig.base.json bun nx run universal:add-component',
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    /* eslint-disable */
    /* eslint-disable sort-keys-fix/sort-keys-fix */
    return {
      name: packageJson.name,
      version: packageJson.version,
      private: packageJson.private,
      license: packageJson.license,
      scripts: packageJson.scripts,
      ...packageJson,
    };
    /* eslint-enable sort-keys-fix/sort-keys-fix */
    /* eslint-enable */
  });
}

/**
 * Installs a few components in a Universal Design System (UDS) library.
 *
 * The following components are installed:
 *
 * - Avatar
 * - Button
 * - Card
 * - Progress
 * - Tooltip
 *
 * The `NX_DRY_RUN` environment variable can be set to `true` to prevent the
 * task from running. The `projectName` option is used to determine the name
 * of the library to install the components in.
 *
 * @param options The normalized options for the generator.
 */
export function installAFewUniversalComponents(universalLibName: string) {
  const isDryRun = process.env.NX_DRY_RUN === 'true';
  const commands = [
    `bun nx run ${universalLibName}:add-component avatar`,
    `bun nx run ${universalLibName}:add-component button`,
    `bun nx run ${universalLibName}:add-component card`,
    `bun nx run ${universalLibName}:add-component input`,
    `bun nx run ${universalLibName}:add-component progress`,
    `bun nx run ${universalLibName}:add-component select`,
    `bun nx run ${universalLibName}:add-component tooltip`,
    `bun nx run ${universalLibName}:add-component typography`,
  ];

  try {
    execCommand(
      buildCommand([...commands.join(' && ').split(' ')]),
      { asString: false, asJSON: false },
      isDryRun,
    );
  } catch (error) {
    console.log('There was a problem installing universal components.');
  }
}

/**
 * Generates a Universal Design System (UDS) library.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
export async function generateUniversalLib(
  tree: Tree,
  options: NormalizedSchema,
) {
  await libraryGenerator(tree, {
    name: options.projectName,
    directory: options.projectRoot,
    bundler: 'tsc',
    compiler: 'tsc',
    linter: 'eslint',
    testEnvironment: 'jsdom',
    unitTestRunner: 'jest',
    projectNameAndRootFormat: 'as-provided',
    setParserOptionsProject: true,
    strict: true,
    skipFormat: options.skipFormat,
    tags: unique([...options.tags.ui, ...options.tags.lib]).join(','),
  });

  cleanupLib(tree, options.projectRoot);
  updateBaseTSConfigPaths(tree, options);
  addLibFiles(tree, options);
  addComponentsJson(tree, options);
  updateProjectConfig(tree, options);
  updateTSConfigs(tree, options);
  updateVSCodeSettings(tree);
  addDependencies(tree);
  updatePackageJsons(tree);
}
