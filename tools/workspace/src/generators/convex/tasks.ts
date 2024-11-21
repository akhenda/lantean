import { execSync } from 'child_process';
import { join } from 'path';

import {
  addDependenciesToPackageJson,
  generateFiles,
  GeneratorCallback,
  readProjectConfiguration,
  Tree,
  updateJson,
  updateProjectConfiguration,
  writeJson,
} from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import { initGenerator as viteInitGenerator, vitestGenerator } from '@nx/vite';
import { tsquery } from '@phenomnomnominal/tsquery';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';
import { ArrayLiteralExpression } from 'typescript';

import { deps, devDeps } from './constants';
import { NormalizedSchema } from './schema';

import {
  getLibTSConfigExclude,
  getLibTSConfigInclude,
  hasNxPackage,
  readNxVersion,
  updateESLintFlatConfigGlobalRules,
  updateESLintFlatConfigIgnoredDependencies,
  updateESLintFlatConfigIgnoreRules,
  updateTSConfigCompilerOptions,
} from '../../utils';
import { Linter, lintProjectGenerator } from '@nx/eslint';

function cleanupLib(tree: Tree, libDirectory: string) {
  tree.delete(`${libDirectory}/src/index.ts`);

  const libFiles = tree.children(`${libDirectory}/src/lib`);

  for (const file of libFiles) {
    tree.delete(`${libDirectory}/src/lib/${file}`);
  }
}

export function addDependencies(tree: Tree) {
  const dependencies: Record<string, string> = deps;
  const devDependencies: Record<string, string> = devDeps;

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

export function addLibFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = { ...options, template: '' };

  generateFiles(tree, join(__dirname, 'files'), options.projectRoot, templateOptions);
}

export function addLinterPlugin(tree: Tree): GeneratorCallback {
  const hasNrwlLinterDependency: boolean = hasNxPackage(tree, '@nx/eslint');

  if (!hasNrwlLinterDependency) {
    const nxVersion = readNxVersion(tree);

    return addDependenciesToPackageJson(tree, {}, { '@nx/eslint': nxVersion });
  }
}

export async function addVitestPlugin(tree: Tree) {
  const hasNrwlVitestDependency: boolean = hasNxPackage(tree, '@nx/vite');

  if (!hasNrwlVitestDependency) {
    const nxVersion = readNxVersion(tree);

    return addDependenciesToPackageJson(tree, {}, { '@nx/vite': nxVersion });
  }
}

function updateTSConfigs(tree: Tree, options: NormalizedSchema) {
  updateJson<TSConfig>(tree, join(options.projectRoot, 'tsconfig.json'), (json) => {
    return updateTSConfigCompilerOptions(json, {
      noPropertyAccessFromIndexSignature: false,
      esModuleInterop: true,
      module: 'ESNext',
    });
  });

  const folders = ['convex'];

  updateJson<TSConfig>(tree, join(options.projectRoot, 'tsconfig.lib.json'), (json) => {
    json.include = [...getLibTSConfigInclude(folders, json.include)];
    json.exclude = [...getLibTSConfigExclude(folders, json.exclude), './convex/_generated/**/*'];

    return json;
  });

  updateJson<TSConfig>(tree, join(options.projectRoot, 'tsconfig.spec.json'), (json) => {
    json.include = getLibTSConfigInclude(folders, json.include, ['spec.ts', 'test.ts', 'spec.tsx', 'test.tsx']);

    return json;
  });
}

function updateConvexJson(tree: Tree, options: NormalizedSchema) {
  writeJson(tree, 'convex.json', { functions: `${options.projectRoot}/convex` });
}

function updateViteConfig(tree: Tree, options: NormalizedSchema) {
  const filePath = join(options.projectRoot, 'vite.config.ts');
  const fileEntry = tree.read(filePath);
  const contents = fileEntry?.toString() ?? '';

  let newContents = tsquery.replace(contents, 'ArrayLiteralExpression', (node) => {
    const trNode = node as ArrayLiteralExpression;

    if (trNode.getText() === "['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']") {
      return trNode.getText().replace(/src/gi, '{src,convex}');
    }

    return null;
  });

  newContents = newContents.replace(
    /environment: 'edge-runtime',/gi,
    "environment: 'edge-runtime',\n\tserver: { deps: { inline: ['convex-test'] } },",
  );

  newContents = newContents.replace(
    /reporters: \['default'\],/gi,
    "reporters: process.env['GITHUB_ACTIONS'] ? ['verbose', 'github-actions'] : ['verbose'],",
  );

  // only write the file if something has changed
  if (newContents !== contents) tree.write(filePath, newContents);
}

function updateESLintConfig(tree: Tree, options: NormalizedSchema) {
  const filePath = join(options.projectRoot, 'eslint.config.js');

  updateESLintFlatConfigIgnoredDependencies(tree, filePath, [...Object.keys(deps), ...Object.keys(devDeps)]);
  updateESLintFlatConfigIgnoreRules(tree, filePath, ['convex/_generated/**/*', 'vite.config.ts', 'tsconfig.json']);
  updateESLintFlatConfigGlobalRules(tree, filePath, ['"no-process-env": "off"']);
}

function updateProjectJson(tree: Tree, options: NormalizedSchema) {
  const { projectName } = options;
  const projectConfig = readProjectConfiguration(tree, projectName);

  delete projectConfig.targets?.build;

  updateProjectConfiguration(tree, projectName, {
    ...projectConfig,
    targets: {
      ...projectConfig.targets,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'convex:dev': {
        executor: 'nx:run-commands',
        options: { command: 'convex dev' },
      },
      'convex:setup': {
        executor: 'nx:run-commands',
        defaultConfiguration: 'local',
        options: {
          commands: ['convex dev --until-success'],
        },
        configurations: {
          local: {},
        },
      },
    },
  });
}

export function initialiseConvex() {
  const result = execSync('npx convex codegen', { stdio: 'inherit' });

  return result;
}

export async function generateConvexLib(tree: Tree, options: NormalizedSchema) {
  await libraryGenerator(tree, {
    name: options.projectName,
    directory: options.projectRoot,
    compiler: 'tsc',
    linter: 'eslint',
    unitTestRunner: 'vitest',
    projectNameAndRootFormat: 'as-provided',
    setParserOptionsProject: true,
    strict: true,
    tags: options.parsedTags.join(','),
  });

  addVitestPlugin(tree);
  addLinterPlugin(tree);

  viteInitGenerator(tree, {});

  await lintProjectGenerator(tree, {
    project: options.projectName,
    skipFormat: true,
    linter: Linter.EsLint,
  });

  await vitestGenerator(tree, {
    project: options.projectName,
    coverageProvider: 'v8',
    uiFramework: 'none',
    testEnvironment: 'edge-runtime',
  });

  cleanupLib(tree, options.projectRoot);
  addLibFiles(tree, options);
  updateTSConfigs(tree, options);
  updateESLintConfig(tree, options);
  updateProjectJson(tree, options);
  updateConvexJson(tree, options);
  updateViteConfig(tree, options);
  addDependencies(tree);
}
