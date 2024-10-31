import { join } from 'path';

import {
  addDependenciesToPackageJson,
  generateFiles,
  offsetFromRoot,
  Tree,
  updateJson,
} from '@nx/devkit';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';
import { applicationGenerator } from '@nx/next';
import { tsquery } from '@phenomnomnominal/tsquery';
import { unique } from 'radash';

import { dependencies, devDependencies } from './constants';
import { NormalizedSchema, UniversalNextGeneratorSchema } from './schema';
import { normalizeOptions } from './utils';

import universalGenerator from '../universal/generator';
import { buildCommand, execCommand } from '../../utils';
import { VariableDeclaration } from 'typescript';

function cleanupLib(tree: Tree, appDirectory: string) {
  tree.write(
    `${appDirectory}/src/app/nx/page.tsx`,
    tree.read(`${appDirectory}/src/app/page.tsx`),
  );
  tree.write(
    `${appDirectory}/src/app/global.css.orig`,
    tree.read(`${appDirectory}/src/app/global.css`),
  );
}

function addLibFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };

  generateFiles(
    tree,
    join(__dirname, 'files', 'patches'),
    'patches',
    templateOptions,
  );
  generateFiles(
    tree,
    join(__dirname, 'files', 'lib'),
    options.projectRoot,
    templateOptions,
  );
}

function updateGlobalCSS(tree: Tree, options: NormalizedSchema) {
  const root = options.projectRoot;
  const originalFilePath = join(root, 'src', 'app', 'global.css.orig');
  const filePath = join(root, 'src', 'app', 'global.css');
  const contents = tree
    .read(filePath)
    .toString()
    .replace(
      '/* Original Styles Here */',
      tree
        .read(originalFilePath)
        .toString()
        .replace('@tailwind base;', '')
        .replace('@tailwind components;', '')
        .replace('@tailwind utilities;', ''),
    );

  tree.write(filePath, contents);
  tree.delete(originalFilePath);
}

function updateTSConfigs(tree: Tree, options: NormalizedSchema) {
  updateJson<TSConfig>(
    tree,
    join(options.projectRoot, 'tsconfig.json'),
    (json) => {
      json.compilerOptions.jsxImportSource = 'nativewind';
      json.include = [...(json.include as string[]), 'nativewind-env.d.ts'];

      return json;
    },
  );
}

function updateNextConfig(tree: Tree, options: NormalizedSchema) {
  let newConfig;

  const { uiName, libName, projectRoot, universalLibImportPath } = options;
  const nextConfigFilePath = join(projectRoot, 'next.config.js');
  const config = tree.read(nextConfigFilePath).toString();

  // Create the `const { withExpo } = require('@expo/next-adapter');` statement
  const newReqStmt = `const { withExpo } = require('@expo/next-adapter');`;

  // Find existing import/require statements
  const reqStmts = tsquery(
    config,
    'VariableStatement:has(CallExpression Identifier[name="require"])',
  );

  // Check if `withExpo` is already imported; if not, insert the new import
  // after the last existing import
  if (!reqStmts.some((stmt) => stmt.getText().includes('@expo/next-adapter'))) {
    const lastImport = reqStmts[reqStmts.length - 1];
    const end = lastImport.getEnd();

    newConfig = config.slice(0, end) + `\n${newReqStmt}` + config.slice(end);
  } else {
    newConfig = config; // No need to add the import if it exists
  }

  const [nextConfigNode] = tsquery(
    config,
    'VariableDeclaration:has(Identifier[name="nextConfig"])',
  ) as VariableDeclaration[];

  if (nextConfigNode) {
    // Extract the existing `nextConfig` object as a string
    const existingConfigText = nextConfigNode.initializer.getText();
    const transpilePackages = [
      // internal libs
      `${universalLibImportPath}/design/${uiName}`,
      `${universalLibImportPath}/design/${libName}`,
      `${universalLibImportPath}/features`,

      // core libs
      'expo',
      'nativewind',
      'react-native',
      'react-native-css-interop',
      'react-native-web',
    ]
    // Create the additional properties
    const additionalConfig = `
    reactStrictMode: true,
    swcMinify: true,
    experimental: { forceSwcTransforms: true },
    transpilePackages: ${JSON.stringify(transpilePackages)},
  `;

    // Wrap the original `nextConfig` with `withExpo` and merge in the new properties
    const nextConfig = ` nextConfig = withExpo(${existingConfigText.slice(0, -1)} ${additionalConfig} })`;

    // Replace the `nextConfig` declaration in the updated code
    newConfig = newConfig.replace(nextConfigNode.getFullText(), nextConfig);
  }

  // only write the file if something has changed
  if (newConfig !== config) tree.write(nextConfigFilePath, newConfig);
}

function updatePackageJsons(tree: Tree) {
  updateJson(tree, 'package.json', (packageJson) => {
    packageJson.scripts = {
      ...(packageJson.scripts ?? {}),
      postinstall: 'patch-package'
    };

    /* eslint-disable */
    /* eslint-disable sort-keys-fix/sort-keys-fix */
    return {
      name: packageJson.name,
      version: packageJson.version,
      private: packageJson.private,
      license: packageJson.license,
      workspaces: packageJson.workspaces,
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

export function installAFewUniversalComponents() {
  const commands = [
    'bun nx run universal:add-component avatar',
    'bun nx run universal:add-component button',
    'bun nx run universal:add-component card',
    'bun nx run universal:add-component progress',
    'bun nx run universal:add-component tooltip',
  ];

  return execCommand(buildCommand([...commands.join(' && ').split(' ')]));
}

export async function generateNextUniversalApp(
  tree: Tree,
  schema: UniversalNextGeneratorSchema,
) {
  const skipFormat = false;
  const { uiName, libName } = normalizeOptions(tree, schema, {});
  const result = await universalGenerator(tree, {
    uiName,
    libName,
    skipFormat,
  });
  const { options: universalLibOptions } = result();
  const options = normalizeOptions(tree, schema, universalLibOptions);

  await applicationGenerator(tree, {
    name: options.projectName,
    directory: options.projectRoot,
    projectNameAndRootFormat: 'as-provided',
    style: 'tailwind',
    tags: unique(options.tags).join(','),
    unitTestRunner: 'jest',
    linter: 'eslint',
    setParserOptionsProject: true,
    e2eTestRunner: 'playwright',
    skipFormat,
    js: false,
    swc: true,
  });

  cleanupLib(tree, options.projectRoot);
  addLibFiles(tree, options);
  updateGlobalCSS(tree, options);
  updateTSConfigs(tree, options);
  updateNextConfig(tree, options);
  updatePackageJsons(tree);
  addDependencies(tree);
}
