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
  vscodeExtensions,
} from './constants';
import { NormalizedSchema } from './schema';
import { updateTSConfigCompilerOptions } from '../../utils';

/**
 * Deletes unnecessary files from the Universal library.
 *
 * The Universal library is created by `@nx/js` and contains unnecessary
 * files such as `package.json` and `src/index.ts` that need to be deleted.
 *
 * @param tree The file system tree.
 * @param libDirectory The directory of the Universal library.
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
 * Updates the TSConfig paths for the Universal library.
 *
 * The paths are updated to include the paths for the design, features,
 * hooks, providers, stores, and utils directories.
 *
 * @param tree The file system tree.
 * @param options The normalized options for the generator.
 */
function updateBaseTSConfigPaths(tree: Tree, options: NormalizedSchema) {
  const { designUI: ui, designUtils } = options.folderNames;
  const { design, features, hooks, providers, stores, utils } = options.paths;

  addTsConfigPath(tree, `${features.path}/*`, [`${features.root}/*`]);
  addTsConfigPath(tree, `${hooks.path}/*`, [`${hooks.root}/*`]);
  addTsConfigPath(tree, `${providers.path}/*`, [`${providers.root}/*`]);
  addTsConfigPath(tree, `${stores.path}/*`, [`${stores.root}/*`]);
  addTsConfigPath(tree, `${utils.path}/*`, [`${utils.root}/*`]);
  addTsConfigPath(tree, `${design.path}/${ui}/*`, [`${design.root}/${ui}/*`]);
  addTsConfigPath(tree, `${design.path}/${designUtils}/*`, [
    `${design.root}/${designUtils}/*`,
  ]);
}

/**
 * Generates the files for the Universal library.
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
    templateOptions
  );
}

/**
 * Generates the `components.json` file for the Universal library.
 *
 * This file is used by the `@shadcn/ui` package to configure the
 * Universal library.
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
    const { designUI: ui, designUtils: utils } = options.folderNames;

    writeJson(tree, 'components.json', {
      $schema: 'https://ui.shadcn.com/schema.json',
      style: 'default',
      rsc: true,
      tsx: true,
      tailwind: {
        config: join(design.root, 'ui', 'tailwind.config.ts'),
        css: join(design.root, 'ui', 'global.css'),
        baseColor: 'neutral',
        cssVariables: true,
      },
      aliases: {
        components: `${design.path}/${ui}/components`,
        ui: `${design.path}/${ui}/components/ui`,
        utils: `${design.path}/${utils}`,
      },
    });
  }
}

/**
 * Updates the project configuration to include a new target called
 * `add-component` that runs the `@${options.npmScope}/universal:add` executor.
 *
 * This target is used to generate new components in the Universal library.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
function updateProjectConfig(tree: Tree, options: NormalizedSchema) {
  updateProjectConfiguration(tree, options.projectName, {
    ...readProjectConfiguration(tree, options.projectName),
    targets: {
      'add-component': {
        executor: `@${options.npmScope}/universal:add`,
      },
    },
  });
}

function updateTSConfigs(tree: Tree, options: NormalizedSchema) {
  updateJson<TSConfig>(
    tree,
    join(options.projectRoot, 'tsconfig.json'),
    (json) => {
      return updateTSConfigCompilerOptions(json, {
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
        ...((json.include ?? []) as Array<string>),
        'design/**/*.ts',
        'features/**/*.ts',
        'hooks/**/*.ts',
        'providers/**/*.ts',
        'stores/**/*.ts',
        'utils/**/*.ts',
      ];
      json.exclude = [
        ...((json.exclude ?? []) as Array<string>),
        'design/**/*.spec.ts',
        'design/**/*.test.ts',
        'features/**/*.spec.ts',
        'features/**/*.test.ts',
        'hooks/**/*.spec.ts',
        'hooks/**/*.test.ts',
        'providers/**/*.spec.ts',
        'providers/**/*.test.ts',
        'stores/**/*.spec.ts',
        'stores/**/*.test.ts',
        'utils/**/*.spec.ts',
        'utils/**/*.test.ts',
      ];

      return json;
    }
  );

  updateJson<TSConfig>(
    tree,
    join(options.projectRoot, 'tsconfig.spec.json'),
    (json) => {
      json.include = [
        ...((json.include ?? []) as Array<string>),
        'design/**/*.test.ts',
        'design/**/*.spec.ts',
        'design/**/*.d.ts',
        'features/**/*.test.ts',
        'features/**/*.spec.ts',
        'features/**/*.d.ts',
        'hooks/**/*.test.ts',
        'hooks/**/*.spec.ts',
        'hooks/**/*.d.ts',
        'providers/**/*.test.ts',
        'providers/**/*.spec.ts',
        'providers/**/*.d.ts',
        'stores/**/*.test.ts',
        'stores/**/*.spec.ts',
        'stores/**/*.d.ts',
        'utils/**/*.test.ts',
        'utils/**/*.spec.ts',
        'utils/**/*.d.ts',
      ];

      return json;
    }
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
    prettierConfigFile
  );

  prettierConfig = {
    ...prettierConfig,
    plugins: [...(prettierConfig.plugins ?? []), 'prettier-plugin-tailwindcss'],
  };

  writeJson(tree, prettierConfigFile, prettierConfig);
}

/**
 * Generates a Universal Design System (UDS) library.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
export async function generateUniversalLib(
  tree: Tree,
  options: NormalizedSchema
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
    tags: unique([...options.tags.ui, ...options.tags.utils]).join(','),
  });

  cleanupLib(tree, options.projectRoot);
  updateBaseTSConfigPaths(tree, options);
  addLibFiles(tree, options);
  addComponentsJson(tree, options);
  updateProjectConfig(tree, options);
  updateTSConfigs(tree, options);
  updateVSCodeSettings(tree);
  addDependencies(tree);
}
