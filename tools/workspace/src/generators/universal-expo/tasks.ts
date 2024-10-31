import { join } from 'path';

import {
  addDependenciesToPackageJson,
  generateFiles,
  offsetFromRoot,
  Tree,
  updateJson,
} from '@nx/devkit';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';
import { expoApplicationGenerator } from '@nx/expo';
import { tsquery } from '@phenomnomnominal/tsquery';
import { unique } from 'radash';

import { dependencies, devDependencies } from './constants';
import { NormalizedSchema, UniversalExpoGeneratorSchema } from './schema';
import { normalizeOptions } from './utils';

import universalGenerator from '../universal/generator';

function cleanupLib(tree: Tree, appDirectory: string) {
  tree.write(
    `${appDirectory}/src/__tests__/welcome.spec.tsx`,
    tree.read(`${appDirectory}/src/app/App.spec.tsx`),
  );
  tree.write(
    `${appDirectory}/src/app/nx.tsx`,
    tree.read(`${appDirectory}/src/app/App.tsx`),
  );
  tree.delete(`${appDirectory}/index.js`);
  tree.delete(`${appDirectory}/src/app/App.tsx`);
  tree.delete(`${appDirectory}/src/app/App.spec.tsx`);
}

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

function updateBabelConfig(tree: Tree, options: NormalizedSchema) {
  const babelConfigFilePath = join(options.projectRoot, '.babelrc.js');
  const contents = tree.read(babelConfigFilePath).toString();
  const newContents = contents.replace(
    "presets: ['babel-preset-expo']",
    "presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel']",
  );

  // only write the file if something has changed
  if (newContents !== contents) tree.write(babelConfigFilePath, newContents);
}

function updateTSConfigs(tree: Tree, options: NormalizedSchema) {
  updateJson<TSConfig>(
    tree,
    join(options.projectRoot, 'tsconfig.app.json'),
    (json) => {
      json.include = [
        ...(json.include as string[]),
        'nativewind-env.d.ts',
        '.expo/types/**/*.ts',
        'expo-env.d.ts',
      ];

      return json;
    },
  );
}

function updateMetroConfig(tree: Tree, options: NormalizedSchema) {
  const metroConfigFilePath = join(options.projectRoot, 'metro.config.js');
  const contents = tree.read(metroConfigFilePath).toString();
  const newContents = tsquery.replace(contents, 'ExpressionStatement', (node) => {
    const text = node.getText();

    if (text.includes('module.exports')) {
      return `
        async function createConfig() {
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
  }).replace(
    "const { mergeConfig } = require('metro-config');",
    `const { mergeConfig } = require('metro-config');
      const { withNativeWind } = require('nativewind/metro');`,
  );

  // only write the file if something has changed
  if (newContents !== contents) tree.write(metroConfigFilePath, newContents);
}

function updatePackageJsons(tree: Tree, options: NormalizedSchema) {
  updateJson(tree, join(options.projectRoot, 'package.json'), (packageJson) => {
    /* eslint-disable */
    /* eslint-disable sort-keys-fix/sort-keys-fix */
    return {
      name: packageJson.name,
      version: packageJson.version,
      private: packageJson.private,
      main: 'expo-router/entry',
      scripts: packageJson.scripts,
      ...packageJson,
    };
    /* eslint-enable sort-keys-fix/sort-keys-fix */
    /* eslint-enable */
  });
}

function addDependencies(tree: Tree) {
  addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

export async function generateExpoUniversalApp(
  tree: Tree,
  schema: UniversalExpoGeneratorSchema,
) {
  const { uiName, libName } = normalizeOptions(tree, schema, {});
  const result = await universalGenerator(tree, { uiName, libName, skipFormat: true });
  const { options: universalLibOptions } = result();
  const options = normalizeOptions(tree, schema, universalLibOptions);

  await expoApplicationGenerator(tree, {
    name: options.projectName,
    displayName: options.displayName,
    directory: options.projectRoot,
    projectNameAndRootFormat: 'as-provided',
    tags: unique(options.tags).join(','),
    unitTestRunner: 'jest',
    linter: 'eslint',
    setParserOptionsProject: true,
    e2eTestRunner: 'detox',
    skipFormat: false,
    js: false,
  });

  cleanupLib(tree, options.projectRoot);
  addLibFiles(tree, options);
  updateAppJson(tree, options);
  updateBabelConfig(tree, options);
  updateTSConfigs(tree, options);
  updateMetroConfig(tree, options);
  updatePackageJsons(tree, options);
  addDependencies(tree);

  return options;
}
