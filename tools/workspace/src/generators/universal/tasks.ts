import { join } from 'path';

import {
  addDependenciesToPackageJson,
  generateFiles,
  offsetFromRoot,
  readProjectConfiguration,
  Tree,
  updateJson,
  updateProjectConfiguration,
  writeJson,
} from '@nx/devkit';
import { addTsConfigPath, libraryGenerator } from '@nx/js';
import { unique } from 'radash';

import {
  dependencies,
  devDependencies,
  vscodeCSSSettingsFile,
  vscodeExtensions,
} from './constants';
import { NormalizedSchema } from './schema';

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
  const {
    designPath,
    designRoot,
    featuresPath,
    featuresRoot,
    hooksPath,
    hooksRoot,
    providersPath,
    providersRoot,
    storesPath,
    storesRoot,
    utilsPath,
    utilsRoot,
    ui,
    utils,
  } = options;

  addTsConfigPath(tree, `${designPath}/${ui}/*`, [`${designRoot}/${ui}/*`]);
  addTsConfigPath(tree, `${designPath}/${utils}/*`, [
    `${designRoot}/${utils}/*`,
  ]);
  addTsConfigPath(tree, `${featuresPath}/*`, [`${featuresRoot}/*`]);
  addTsConfigPath(tree, `${hooksPath}/*`, [`${hooksRoot}/*`]);
  addTsConfigPath(tree, `${providersPath}/*`, [`${providersRoot}/*`]);
  addTsConfigPath(tree, `${storesPath}/*`, [`${storesRoot}/*`]);
  addTsConfigPath(tree, `${utilsPath}/*`, [`${utilsRoot}/*`]);
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
    const { designPath, designRoot, ui, utils } = options;

    writeJson(tree, 'components.json', {
      $schema: 'https://ui.shadcn.com/schema.json',
      style: 'default',
      rsc: true,
      tsx: true,
      tailwind: {
        config: join(designRoot, 'ui', 'tailwind.config.ts'),
        css: join(designRoot, 'ui', 'global.css'),
        baseColor: 'neutral',
        cssVariables: true,
      },
      aliases: {
        components: `${designPath}/${ui}/components`,
        ui: `${designPath}/${ui}/components/ui`,
        utils: `${designPath}/${utils}`,
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
  const cssSettingsFilePath = join('.vscode', vscodeCSSSettingsFile);

  if (!tree.exists(cssSettingsFilePath)) {
    writeJson(tree, cssSettingsFilePath, {
      /* eslint-disable */
      /* eslint-disable sort-keys-fix/sort-keys-fix */
      version: 1.1,
      atDirectives: [
        {
          name: '@tailwind',
          description:
            "Use the @tailwind directive to insert Tailwind's `base`, `components`, `utilities`, and `screens` styles into your CSS.",
        },
      ],
      /* eslint-enable sort-keys-fix/sort-keys-fix */
      /* eslint-enable */
    });
  }

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
    /* eslint-disable */
    /* eslint-disable @typescript-eslint/naming-convention, sort-keys-fix/sort-keys-fix */
    return {
      ...settingsJson,

      'tailwindCSS.experimental.classRegex': [
        ['tva\\((([^()]*|\\([^()]*\\))*)\\)', '["\'`]([^"\'`]*).*?["\'`]'],
      ],
    };
    /* eslint-enable @typescript-eslint/naming-convention, sort-keys-fix/sort-keys-fix */
    /* eslint-enable */
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
    bundler: 'tsc',
    compiler: 'tsc',
    linter: 'eslint',
    testEnvironment: 'jsdom',
    unitTestRunner: 'jest',
    projectNameAndRootFormat: 'as-provided',
    setParserOptionsProject: true,
    strict: true,
    tags: unique([...options.uiTags, ...options.utilsTags]).join(','),
  });

  cleanupLib(tree, options.projectRoot);
  updateBaseTSConfigPaths(tree, options);
  addLibFiles(tree, options);
  addComponentsJson(tree, options);
  updateProjectConfig(tree, options);
  updateVSCodeSettings(tree);
  addDependencies(tree);
}
