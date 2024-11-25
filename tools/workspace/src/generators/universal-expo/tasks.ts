import { join } from 'path';

import { addDependenciesToPackageJson, generateFiles, offsetFromRoot, Tree, updateJson } from '@nx/devkit';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';
import { expoApplicationGenerator } from '@nx/expo';
import { tsquery } from '@phenomnomnominal/tsquery';
import { unique } from 'radash';

import { dependencies, devDependencies } from './constants';
import { NormalizedSchema } from './schema';

import { eslintFlatConfigExtendAConfig } from '../../utils';

/**
 * Deletes unnecessary files from the Expo library.
 *
 * The library is created by `@nx/expo` and contains unnecessary
 * files such as `App.tsx` and `App.spec.tsx` that need to be deleted.
 *
 * @param tree The file system tree.
 * @param appDirectory The directory of the Expo library.
 */
function cleanupLib(tree: Tree, appDirectory: string) {
  tree.write(`${appDirectory}/src/__tests__/welcome.spec.tsx`, tree.read(`${appDirectory}/src/app/App.spec.tsx`));
  tree.write(`${appDirectory}/src/app/(tabs)/nx/index.tsx`, tree.read(`${appDirectory}/src/app/App.tsx`));
  tree.delete(`${appDirectory}/src/app/App.tsx`);
  tree.delete(`${appDirectory}/src/app/App.spec.tsx`);
}

/**
 * Generates the files for the Expo library.
 *
 * This function uses a template to generate necessary files for the Expo library
 * within the specified project root directory. It is separated from the main
 * generator for reuse in update generators.
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

  generateFiles(tree, join(__dirname, 'files'), options.projectRoot, templateOptions);
}

/**
 * Updates the app.json file with the correct name, slug, and userInterfaceStyle.
 *
 * It keeps all the existing properties except for the userInterfaceStyle which
 * is set to automatic.
 *
 * If the app.json file does not exist, it will not be created.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
function updateAppJson(tree: Tree, options: NormalizedSchema) {
  const appJsonFilePath = join(options.projectRoot, 'app.json');

  if (tree.exists(appJsonFilePath)) {
    updateJson(tree, appJsonFilePath, ({ expo, ...appJson }) => {
      return {
        expo: {
          name: expo.name,
          slug: expo.slug,
          version: expo.version,
          orientation: expo.orientation,
          icon: expo.icon,
          scheme: options.names.propertyName.toLowerCase(),
          userInterfaceStyle: 'automatic',
          ...expo,
        },
        ...appJson,
      };
    });
  }
}

/**
 * Updates the Babel configuration to include the NativeWind preset.
 *
 * This function modifies the `.babelrc.js` file to add the `nativewind`
 * and `nativewind/babel` presets to the existing configuration, enabling
 * enhanced styling capabilities in the Expo project.
 *
 * The file is only updated if changes are detected to avoid unnecessary
 * writes.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
function updateBabelConfig(tree: Tree, options: NormalizedSchema) {
  const babelConfigFilePath = join(options.projectRoot, '.babelrc.js');
  const contents = tree.read(babelConfigFilePath).toString();
  const newContents = contents
    .replace(
      "presets: ['babel-preset-expo']",
      "presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel']",
    )
    .replace('return', '\nreturn');

  // only write the file if something has changed
  if (newContents !== contents) tree.write(babelConfigFilePath, newContents);
}

/**
 * Updates the Expo project's `tsconfig.app.json` file to include the
 * NativeWind env file and the Expo types.
 *
 * The `tsconfig.app.json` file is updated to include the `nativewind-env.d.ts`
 * and `.expo/types/../.ts` files, and the `expo-env.d.ts` file is added to
 * the `include` array.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
function updateTSConfigs(tree: Tree, options: NormalizedSchema) {
  updateJson<TSConfig>(tree, join(options.projectRoot, 'tsconfig.app.json'), (json) => {
    json.include = [...(json.include as string[]), 'nativewind-env.d.ts', '.expo/types/**/*.ts', 'expo-env.d.ts'];

    return json;
  });
}

/**
 * Updates the Metro configuration file to include NativeWind.
 *
 * The `metro.config.js` file is updated to include the `withNativeWind`
 * function from the `nativewind/metro` module and to wrap the existing
 * config in a call to `withNativeWind`. This is necessary for Metro to
 * compile the NativeWind global CSS file.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
function updateMetroConfig(tree: Tree, options: NormalizedSchema) {
  const metroConfigFilePath = join(options.projectRoot, 'metro.config.js');
  const contents = tree.read(metroConfigFilePath).toString();
  const newContents = tsquery
    .replace(contents, 'ExpressionStatement', (node) => {
      const text = node.getText();

      if (text.includes('module.exports')) {
        return `async function createConfig() {
          ${text.replace('module.exports = ', 'const nxConfig = await ')}

          const nativeWindConfig = withNativeWind(nxConfig, {
            input: './src/global.css'
          });

          nativeWindConfig.resetCache = true;

          return nativeWindConfig;
        }

        module.exports = createConfig();
      `;
      }
      // return undefined does not replace anything
    })
    .replace(
      "const { mergeConfig } = require('metro-config');",
      `const { mergeConfig } = require('metro-config');\n\
      const { withNativeWind } = require('nativewind/metro');\n`,
    )
    .replace('defaultConfig.resolver;', 'defaultConfig.resolver;\n')
    .replace('async function createConfig()', '\nasync function createConfig()')
    .replace('const nativeWindConfig =', '\nconst nativeWindConfig =')
    .replace('nativeWindConfig.resetCache', '\nnativeWindConfig.resetCache')
    .replace('return nativeWindConfig;', '\nreturn nativeWindConfig;')
    .replace('module.exports = create', '\nmodule.exports = create');

  // only write the file if something has changed
  if (newContents !== contents) tree.write(metroConfigFilePath, newContents);
}

/**
 * Updates the root `package.json` to include the necessary information
 * for the generator.
 *
 * Adds the `main` field and sets it to `'index.js'`.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
function updatePackageJsons(tree: Tree, options: NormalizedSchema) {
  updateJson(tree, join(options.projectRoot, 'package.json'), (packageJson) => {
    /* eslint-disable */
    /* eslint-disable sort-keys-fix/sort-keys-fix */
    return {
      name: packageJson.name,
      version: packageJson.version,
      private: packageJson.private,
      main: 'index.js',
      scripts: packageJson.scripts,
      ...packageJson,
    };
    /* eslint-enable sort-keys-fix/sort-keys-fix */
    /* eslint-enable */
  });
}

/**
 * Adds all necessary dependencies for the universal-expo generator to the
 * project.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @returns The updated dependencies.
 */
function addDependencies(tree: Tree) {
  addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

/**
 * Updates the ESLint configuration file for the Expo project.
 *
 * This function modifies the `eslint.config.js` file located in the
 * project's root directory to extend the configuration with the specified
 * import path and configuration name.
 *
 * @param tree The file system tree of the workspace.
 * @param options The normalized options containing the project details.
 */
function updateEslintConfig(tree: Tree, options: NormalizedSchema) {
  const { projectRoot } = options;
  const filePath = join(projectRoot, 'eslint.config.js');

  eslintFlatConfigExtendAConfig(tree, filePath, options.sheriffImportPath, 'expo');
}

/**
 * Generates a new Expo universal app.
 *
 * The generator first calls the `universal` generator to generate the
 * universal library, then calls the `expo-application` generator to
 * generate the Expo app. Finally, it updates the `app.json` file to
 * include the necessary information for the universal library.
 *
 * The generator also updates the `babel.config.js` file to include
 * NativeWind, updates the `tsconfig.app.json` file to include the
 * NativeWind env file, and updates the Metro configuration file to
 * include NativeWind.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param schema The options passed to the generator.
 * @returns The normalized options for the generator.
 */
export async function generateExpoUniversalApp(tree: Tree, options: NormalizedSchema) {
  await expoApplicationGenerator(tree, {
    name: options.projectName,
    displayName: options.displayName,
    directory: options.projectRoot,
    tags: unique(options.tags).join(','),
    unitTestRunner: 'jest',
    linter: 'eslint',
    setParserOptionsProject: true,
    e2eTestRunner: 'detox',
    skipFormat: options.skipFormat,
    js: false,
  });

  cleanupLib(tree, options.projectRoot);
  addLibFiles(tree, options);
  updateAppJson(tree, options);
  updateBabelConfig(tree, options);
  updateTSConfigs(tree, options);
  updateMetroConfig(tree, options);
  updatePackageJsons(tree, options);
  updateEslintConfig(tree, options);
  addDependencies(tree);

  return options;
}
