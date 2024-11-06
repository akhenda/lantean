import { join } from 'path';
import { unique } from 'radash';

import {
  addDependenciesToPackageJson,
  generateFiles,
  names,
  offsetFromRoot,
  readProjectConfiguration,
  Tree,
  updateJson,
  updateProjectConfiguration,
  writeJson,
} from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/package';

import { addDevDependencyToPackageJson } from '../../devkit';
import { getImportPath, getNpmScope } from '../../utils';

import {
  eslintConfigFile,
  eslintLibDepVersions,
  eslintLibDirectory,
  vscodeCSSSettingsFile,
  vscodeExtensions,
} from './constants';
import { NormalizedSchema, SheriffGeneratorSchema } from './schema';
import { normalizeOptions } from './utils';

/**
 * This function is a safety net. It warns the user if the repository has not been
 * converted to ESLint Flat Config. It does not perform the conversion itself.
 *
 * If the repository is not converted, nx g @nx/eslint:convert-to-flat-config should
 * be run first.
 */
export function hasFlatConfig(tree: Tree) {
  if (!tree.exists(eslintConfigFile) && !tree.exists('eslint.config.js')) {
    console.error(`Sheriff needs this NX Monorepo to be converted to Eslint Flat Config.`);
    console.error(`Try to convert it first using nx g @nx/eslint:convert-to-flat-config`);

    return false;
  }

  return true;
}

/**
 * Generates the files for the ESLint Config library.
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

  generateFiles(tree, join(__dirname, 'files'), options.projectRoot, templateOptions);
}

/**
 * Updates the TSConfig for the library to include `.mjs` files.
 *
 * The `tsconfig.lib.json` file is updated to include `*.mjs` in the
 * `include` property. This allows the library to be built with modern
 * JavaScript syntax.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
function updateTSConfig(tree: Tree, options: NormalizedSchema) {
  updateJson(tree, join(options.projectRoot, 'tsconfig.lib.json'), (json) => {
    json.include = [...(json.include ?? []), './**/*.mjs'];

    return json;
  });
}

/**
 * Updates the ESLint configuration file to support modern JavaScript syntax.
 *
 * It adds a new override with the following configuration:
 * - `files`: Only applies to `.mjs` files.
 * - `parserOptions.sourceType`: Set to `'module'` to support ES modules.
 * - `parserOptions.ecmaVersion`: Set to `2022` to support the latest ECMAScript features.
 * - `rules`: An empty object that can be extended with additional rules.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param options The normalized options for the generator.
 */
function updateEslintConfig(tree: Tree, options: NormalizedSchema) {
  updateJson<JSONSchemaForESLintConfigurationFiles>(
    tree,
    join(options.projectRoot, '.eslintrc.json'),
    (eslintConfig) => {
      eslintConfig.overrides = [
        {
          files: ['*.mjs'],
          parserOptions: { sourceType: 'module', ecmaVersion: 2022 },
          rules: {},
        },
        ...(eslintConfig.overrides ?? []),
      ];

      return eslintConfig;
    },
  );
}

/**
 * Adds dependencies to `package.json`. This function is used to add deps to
 * the root `package.json` and the `package.json` of the `eslint-config`
 * library.
 *
 * @param tree The file system tree.
 * @returns The updated dependencies.
 */
function addDependencies(tree: Tree) {
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = eslintLibDepVersions;

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

/**
 * Updates the root and lib project's `package.json` to include all necessary
 * dependencies and configuration.
 *
 * @param tree The file system tree.
 * @param options The options for the generator.
 */
function updatePackageJsons(tree: Tree, options: NormalizedSchema) {
  updateJson(tree, 'package.json', (packageJson) => {
    packageJson.workspaces = [
      `${options.appsDir}/*`,
      `${options.libsDir}/*`,
      `${options.libsDir}/${eslintLibDirectory}/*`,
    ];

    /* eslint-disable @typescript-eslint/naming-convention */
    packageJson.scripts = {
      ...(packageJson.scripts ?? {}),
      affected: 'nx affected',
      'affected:apps': 'nx affected:apps',
      'affected:libs': 'nx affected:libs',
      build: 'bun nx run-many --target=build --all',
      'deps:update': 'bun nx run-many --target=update-deps --all',
      help: 'nx help',
      lint: 'bun nx run-many --target=lint --all',
      'lint:fix': 'bun nx run-many --target=lint:fix --all',
      nx: 'nx',
      'nx:reset': 'bun nx reset',
      'nx:test': 'bun nx test',
      'nx:update': 'nx migrate latest',
      test: 'bun nx run-many --target=test --all',
    };
    /* eslint-enable @typescript-eslint/naming-convention */

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
    packageJson.peerDependenciesMeta = {
      jest: { optional: true },
      prettier: { optional: true },
    };
    packageJson.peerDependencies = { ...eslintLibDepVersions };
    packageJson.dependencies = deps;
    packageJson.devDependencies = { ...(packageJson.devDependencies ?? {}) };

    return packageJson;
  });
}

/**
 * Updates VSCode settings in `.vscode/settings.json`.
 *
 * The generated settings are opinionated and try to enforce a consistent
 * coding style across the project. The settings are also designed to work
 * seamlessly with the configured ESLint rules.
 *
 * If you want to override any of the settings, you can do so by adding your
 * own settings to the `settings.json` file.
 *
 * @param tree The file system tree.
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
        recommendations: unique([...extensionsJson.recommendations, ...vscodeExtensions]),
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

      'files.eol': '\n',
      'editor.tabSize': 2,
      'editor.insertSpaces': true,

      'search.exclude': {
        'yarn.lock': true,
        'pnpm-lock.yaml': true,
        'bun.lockb': true,
      },

      // Format all filetypes on save
      'editor.formatOnSave': true,

      // enable prettier as default formatter for all supported filetypes
      'editor.defaultFormatter': 'esbenp.prettier-vscode',

      // run eslint --fix on save
      'editor.codeActionsOnSave': {
        'source.addMissingImports': 'explicit',
        'source.fixAll.eslint': 'explicit',
        'source.organizeImports': 'never',
      },

      // HTML specific settings
      '[html]': {
        'editor.formatOnSave': true,
        'editor.defaultFormatter': 'esbenp.prettier-vscode',
      },

      // JavaScript specific settings
      '[javascript]': {
        'editor.formatOnSave': true,
        'editor.defaultFormatter': 'esbenp.prettier-vscode',
      },

      // Typescript specific settings
      '[typescript]': {
        'editor.formatOnSave': true,
        'editor.defaultFormatter': 'esbenp.prettier-vscode',
      },

      // JSONC specific settings
      '[jsonc]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },

      // Other rules
      'editor.wordWrap': 'on',
      'files.trimTrailingWhitespace': true,
      'files.insertFinalNewline': true,

      // ESLint will not lint .vue, .ts or .tsx files in VSCode by default
      // so enable linting for these files
      // Also JSONC eslint plugin needs it
      // https://github.com/ota-meshi/eslint-plugin-jsonc#visual-studio-code
      'eslint.validate': ['javascript', 'javascriptreact', 'vue', 'typescript', 'typescriptreact', 'json5'],

      'css.customData': [`.vscode/${vscodeCSSSettingsFile}`],
      'files.associations': { '*.css': 'tailwindcss' },

      'tailwindCSS.experimental.classRegex': [['tva\\((([^()]*|\\([^()]*\\))*)\\)', '["\'`]([^"\'`]*).*?["\'`]']],

      // https://blog.adarshkonchady.com/fixing-vscode-issues-with-eslint-on-nx-monorepo
      // 'eslint.workingDirectories': [
      //   { pattern: './apps/*/' },
      //   { pattern: './libs/*/' },
      //   { pattern: './packages/*/' },
      // ],
    };
    /* eslint-enable @typescript-eslint/naming-convention, sort-keys-fix/sort-keys-fix */
    /* eslint-enable */
  });
}

/**
 * Adds a target to the ESLint config project to run semantic-release.
 *
 * @param tree The virtual file system tree.
 * @param options The options passed to the schematic.
 */
function addSemanticReleaseTarget(tree: Tree, options: NormalizedSchema) {
  const projectConfiguration = readProjectConfiguration(tree, options.name);

  updateProjectConfiguration(tree, options.projectName, {
    ...projectConfiguration,
    targets: {
      ...projectConfiguration.targets,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'semantic-release': {
        executor: '@theunderscorer/nx-semantic-release:semantic-release',
        options: {
          changelog: true,
          github: true,
          npm: true,
          tagFormat: `${options.projectName}-v\${VERSION}`,
        },
      },
    },
  });
}

/**
 * Updates the ESLint ignore file to ignore the given project directory, so
 * that ESLint does not complain about the generated ESLint configuration
 * file.
 *
 * @param tree The file system tree.
 * @param options The schema options passed to the generator.
 */
function updateESLintIgnoreFile(tree: Tree, options: NormalizedSchema) {
  const ignoreFilePath = '.eslintignore';

  if (!tree.exists(ignoreFilePath)) return;

  const ignores = tree.read(ignoreFilePath, 'utf8').split('\n');

  if (!ignores.includes(`# ${getImportPath(tree, options.projectDirectory)}`)) {
    const files = [
      `# ${getImportPath(tree, options.projectDirectory)}`,
      '.eslintrc.js',
      '.eslintrc.cjs',
      'eslint.config.cjs',
      'eslint.config.mjs',
      'eslint.config.mts',
      '.prettier.cjs',
      'coverage',
      '/coverage',
      '.npmrc',
      '.github',
      'package.json',
      'tsconfig.json',
      'jest.config.js',
      'jest.config.ts',
      'jest.config.cjs',
      'jest.config.mjs',
      'jest.config.mts',
      '',
      '# The eslint config test fixtures contain files that deliberatly fail linting',
      "# in order to tests that the config reports those errors. We don't want the",
      '# normal eslint run to complain about those files though so ignore them here.',
      `${options.projectRoot}/src/tests/fixtures`,
      `${options.projectRoot}/src/**/*/fixtures`,
      '**/*/fixtures',
    ];

    ignores.push(...files, '');
  }

  if (ignores.length) tree.write('./.eslintignore', ignores.join('\n'));
}

/**
 * Updates the `.prettierignore` file if it exists.
 *
 * @param tree The virtual file system tree.
 * @param options The options passed to the generator.
 */
function updatePrettierIgnoreFile(tree: Tree, options: NormalizedSchema) {
  const ignoreFilePath = '.prettierignore';

  if (!tree.exists(ignoreFilePath)) return;

  const ignores = tree.read(ignoreFilePath, 'utf8').split('\n');

  if (!ignores.includes(`# ${getImportPath(tree, options.projectDirectory)}`)) {
    const files = [
      `# ${getImportPath(tree, options.projectDirectory)}`,
      '# The eslint config test fixtures contain files that deliberatly fail linting',
      "# in order to tests that the config reports those errors. We don't want the",
      '# normal prettier run to complain about those files though so ignore them here.',
      `${options.projectRoot}/src/tests/fixtures`,
      `${options.projectRoot}/src/**/*/fixtures`,
      '**/*/fixtures',
    ];

    if (files.length) ignores.push(...files, '');
  }

  if (ignores.length) tree.write('./.prettierignore', ignores.join('\n'));
}

/**
 * Updates the root `.gitignore` to include paths to ignore.
 *
 * If the `.gitignore` does not already include the `# ${path}` line,
 * it adds the following files to the `.gitignore`:
 * - `*.orig`
 * - `!.vscode/${vscodeCSSSettingsFile}`
 *
 * @param tree The file system tree
 * @param options The options passed to the generator
 */
function updateGitIgnoreFile(tree: Tree, options: NormalizedSchema) {
  const ignoreFilePath = '.gitignore';

  if (!tree.exists(ignoreFilePath)) return;

  const ignores = tree.read(ignoreFilePath, 'utf8').split('\n');

  if (!ignores.includes(`# ${getImportPath(tree, options.projectDirectory)}`)) {
    const files = [`# ${getImportPath(tree, options.projectDirectory)}`, '*.orig', `!.vscode/${vscodeCSSSettingsFile}`];

    if (files.length) ignores.push(...files, '');
  }

  if (ignores.length) tree.write('./.gitignore', ignores.join('\n'));
}

/**
 * Generates a dedicated ESLint config project.
 *
 * @param tree The virtual file system tree.
 * @param options The options passed to the generator.
 */
export async function generateConfigLib(tree: Tree, options: SheriffGeneratorSchema = {}) {
  const normalizedOptions = normalizeOptions(tree, options);

  await libraryGenerator(tree, {
    bundler: 'tsc',
    compiler: 'tsc',
    buildable: true,
    publishable: true,
    importPath: normalizedOptions.importPath,
    directory: normalizedOptions.projectRoot,
    js: true,
    linter: 'eslint',
    testEnvironment: 'node',
    unitTestRunner: 'none',
    name: normalizedOptions.projectName,
    projectNameAndRootFormat: 'as-provided',
    setParserOptionsProject: false,
    strict: true,
    tags: normalizedOptions.parsedTags.join(','),
  });

  addLibFiles(tree, normalizedOptions);
  addSemanticReleaseTarget(tree, normalizedOptions);
  updateESLintIgnoreFile(tree, normalizedOptions);
  updatePrettierIgnoreFile(tree, normalizedOptions);
  updateGitIgnoreFile(tree, normalizedOptions);
  updateTSConfig(tree, normalizedOptions);
  updateEslintConfig(tree, normalizedOptions);
  updateVSCodeSettings(tree);
  addDependencies(tree);
  addDevDependencyToPackageJson(tree, normalizedOptions.importPath, 'workspace:*');
  updatePackageJsons(tree, normalizedOptions);
}
