import { readFileSync } from 'fs';
import { join, resolve } from 'path';

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

import { addDevDependencyToPackageJson } from '../../devkit';

import { eslintLibDirectory, eslintLibNameDeps, prettierVersion } from './constants';
import { LintingGeneratorSchema } from './schema';
import { NormalizedSchema } from './types';
import { getImportPath, getNpmScope, normalizeOptions } from './utils';

export function addLibFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
    npmScope: getNpmScope(tree),
    npmScopeTitle: names(getNpmScope(tree)).className,
  };

  generateFiles(tree, join(__dirname, 'files'), options.projectRoot, templateOptions);

  updateJson(tree, join(options.projectRoot, 'src/tests/fixtures/basic-app/project.json'), (projectJson) => {
    projectJson.name = `${options.projectName}-tests`;

    return projectJson;
  });
}

function addDependencies(tree: Tree) {
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {
    ...eslintLibNameDeps,
    prettier: prettierVersion,
  };

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

function updateJestConfig(tree: Tree, options: NormalizedSchema) {
  const filePath = join(options.projectRoot, 'jest.config.js');
  const fileEntry = tree.read(filePath);
  const contents = fileEntry?.toString() ?? '';

  const newContents = contents.replace(
    /moduleFileExtensions: \['ts', 'js', 'html'\],/gi,
    [
      "moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'json'],",
      "testPathIgnorePatterns: ['.*/tests/fixtures/'],",
      '// verbose: true,',
    ].join('\n\t'),
  );

  // only write the file if something has changed
  if (newContents !== contents) tree.write(filePath, newContents);
}

function updatePackageJsons(tree: Tree, options: NormalizedSchema) {
  updateJson(tree, 'package.json', (packageJson) => {
    packageJson.workspaces = [
      `${options.appsDir}/*`,
      `${options.libsDir}/*`,
      `${options.libsDir}/${eslintLibDirectory}/*`,
    ];

    packageJson.scripts = {
      ...(packageJson.scripts ?? {}),
      help: 'nx help',
      affected: 'nx affected',
      'affected:apps': 'nx affected:apps',
      'affected:libs': 'nx affected:libs',
      'nx:update': 'nx migrate latest',
      'nx:test': 'pnpm exec nx test',
      'nx:reset': 'pnpm exec nx reset',
      'deps:update': 'pnpm exec nx run-many --target=update-deps --all',
      test: 'pnpm exec nx run-many --target=test --all',
      build: 'pnpm exec nx run-many --target=build --all',
      lint: 'pnpm exec nx run-many --target=lint --all',
      'lint:fix': 'pnpm exec nx run-many --target=lint:fix --all',
    };

    return {
      name: packageJson.name,
      version: packageJson.version,
      private: packageJson.private,
      license: packageJson.license,
      workspaces: packageJson.workspaces,
      scripts: packageJson.scripts,
      ...packageJson,
    };
  });

  let deps = {};

  updateJson(tree, join(options.projectRoot, 'package.json'), (packageJson) => {
    deps = { ...deps, ...packageJson.dependencies };

    delete packageJson.dependencies;

    packageJson.author = 'J.A.';
    packageJson.description = "J.A's ESLint rules and configs.";
    packageJson.keywords = ['eslint', 'eslintconfig', 'eslint-config'];

    return packageJson;
  });

  updateJson(tree, join(options.projectRoot, 'package.json'), (packageJson) => {
    packageJson.peerDependencies = {
      eslint: '~8.57.0',
      jest: '~29.7.0',
      prettier: '~3.3.3',
    };
    packageJson.peerDependenciesMeta = {
      jest: { optional: true },
      prettier: { optional: true },
    };
    packageJson.dependencies = deps;
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...eslintLibNameDeps,
    };

    return packageJson;
  });
}

function addSemanticReleaseTarget(tree: Tree, options: NormalizedSchema) {
  const projectConfiguration = readProjectConfiguration(tree, options.name);

  updateProjectConfiguration(tree, options.projectName, {
    root: projectConfiguration.root,
    targets: {
      ...projectConfiguration.targets,
      'semantic-release': {
        executor: '@theunderscorer/nx-semantic-release:semantic-release',
        options: {
          github: true,
          changelog: true,
          npm: true,
          tagFormat: options.projectName + '-v${VERSION}',
        },
      },
    },
  });
}

async function updateESLintIgnoreFile(tree: Tree, options: NormalizedSchema) {
  const ignores = readFileSync(resolve(tree.root, '.eslintignore'), {
    encoding: 'utf8',
  }).split('\n');

  if (!ignores.includes(`# ${getImportPath(tree, options.projectDirectory)}`)) {
    const files = [
      `# ${getImportPath(tree, options.projectDirectory)}`,
      '.eslintrc.js',
      '.eslintrc.cjs',
      '.prettier.cjs',
      'coverage',
      '/coverage',
      '.npmrc',
      '.github',
      'package.json',
      'tsconfig.json',
      'jest.config.js',
      'jest.config.ts',
      '',
      '# The eslint plugin test fixtures contain files that deliberatly fail linting',
      "# in order to test that the plugin reports those errors. We don't want the",
      '# normal eslint run to complain about those files though so ignore them here.',
      `${options.projectRoot}/src/tests/fixtures`,
      `${options.projectRoot}/src/**/*/fixtures`,
      '**/*/fixtures',
    ];

    ignores.push(...files, '');
  }

  if (ignores.length) tree.write('./.eslintignore', ignores.join('\n'));
}

async function updatePrettierIgnoreFile(tree: Tree, options: NormalizedSchema) {
  const ignores = readFileSync(resolve(tree.root, '.prettierignore'), {
    encoding: 'utf8',
  }).split('\n');

  if (!ignores.includes(`# ${getImportPath(tree, options.projectDirectory)}`)) {
    const files = [];

    if (files.length) ignores.push(...files, '');
  }

  if (ignores.length) tree.write('./.prettierignore', ignores.join('\n'));
}

/**
 * Generates a dedicated ESLint config project.
 *
 * @param tree The virtual file system tree.
 * @param options The options passed to the generator.
 */
export async function generateConfigLib(tree: Tree, options: LintingGeneratorSchema = {}) {
  const normalizedOptions = normalizeOptions(tree, options);

  await libraryGenerator(tree, {
    name: normalizedOptions.projectName,
    js: true,
    compiler: 'tsc',
    projectNameAndRootFormat: 'as-provided',
    directory: normalizedOptions.projectRoot,
    setParserOptionsProject: true,
    linter: 'eslint',
    strict: true,
    tags: normalizedOptions.parsedTags.join(','),
  });

  addLibFiles(tree, normalizedOptions);
  addSemanticReleaseTarget(tree, normalizedOptions);
  updateJestConfig(tree, normalizedOptions);
  updateESLintIgnoreFile(tree, normalizedOptions);
  updatePrettierIgnoreFile(tree, normalizedOptions);
  addDependencies(tree);
  addDevDependencyToPackageJson(tree, normalizedOptions.importPath, 'workspace:*');
  updatePackageJsons(tree, normalizedOptions);
}
