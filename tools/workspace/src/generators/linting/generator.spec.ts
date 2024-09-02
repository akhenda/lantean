import {
  addProjectConfiguration,
  convertNxGenerator,
  installPackagesTask,
  readJson,
  Tree,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { SchemaForPrettierrc } from '@schemastore/prettierrc';

import lintingGenerator from './generator';
import {
  eslintConfigFile,
  eslintPluginPrettier,
  prettierConfigFile,
  prettierPlugin,
} from './constants';
import { writeEsLintConfig, readEsLintConfig } from './eslint-config';
import {
  deprecationRule,
  esLintRule,
  importOrderRule,
  sonarJSRule,
  typescriptRule,
  unusedImportsRule,
} from './rules';

import { formatWorkspaceTask } from '../../devkit';
import { prettierDefaultConfig } from './prettier';

/**
 * Angular schematic to setup ESLint in a workspace.
 */
export const lintingSchematic = convertNxGenerator(lintingGenerator);
const timeout = 10_000;

jest.mock('../../devkit', () => ({
  ...jest.requireActual('../../devkit'),
  lintWorkspaceTask: jest.fn(),
  formatWorkspaceTask: jest.fn(),
}));

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  formatFiles: jest.fn(),
  installPackagesTask: jest.fn(),
}));

jest.setTimeout(10_000);

describe('@lantean/workspace eslint generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    writeEsLintConfig(tree, {});
  });

  it('should run successfully', async () => {
    await lintingGenerator(tree, {});

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig).toBeDefined();
  });

  it('should provide a schematic', async () => {
    expect(typeof lintingSchematic({})).toBe('function');
  });

  it('should run tasks', async () => {
    const tasks = await lintingGenerator(tree, {});

    tasks();

    // expect(lintWorkspaceTask).toHaveBeenCalled();
    expect(installPackagesTask).toHaveBeenCalled();
  });

  it('should apply eslint:recommended', async () => {
    await lintingGenerator(tree, { eslintRecommended: true });

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig.overrides?.[0]).toStrictEqual(esLintRule);
    expect(eslintConfig.env).toStrictEqual({
      node: true,
      browser: true,
      es2022: true,
    });
  });

  it('should apply sonarjs/recommended', async () => {
    await lintingGenerator(tree, { sonarJs: true });

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig.plugins?.includes('sonarjs')).toBeTruthy();
    expect(eslintConfig.overrides?.[0]).toStrictEqual(sonarJSRule);
  });

  it('should apply unused imports', async () => {
    await lintingGenerator(tree, { unusedImports: true });

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig.plugins?.includes('unused-imports')).toBeTruthy();
    expect(eslintConfig.overrides?.[0]).toStrictEqual(unusedImportsRule);
  });

  it(
    'should apply @typescript-eslint/recommended',
    async () => {
      addLibraries();

      await lintingGenerator(tree, { typescriptRecommended: true });

      const eslintConfig = readEsLintConfig(tree);

      expect(eslintConfig.plugins?.includes('@typescript-eslint')).toBeTruthy();
      expect(eslintConfig.overrides?.[0]).toStrictEqual(typescriptRule);
      expect(
        readEsLintConfig(tree, `libs/lib1/${eslintConfigFile}`).overrides?.[0]
      ).toStrictEqual({
        files: ['*.ts', '*.tsx'],
        parserOptions: { project: ['libs/lib1/tsconfig*.json'] },
      });
    },
    timeout
  );

  it(
    'should apply deprecation',
    async () => {
      addLibraries();

      await lintingGenerator(tree, { deprecation: true });

      const eslintConfig = readEsLintConfig(tree);

      expect(eslintConfig.plugins?.includes('deprecation')).toBeTruthy();
      expect(eslintConfig.overrides?.[0]).toStrictEqual(deprecationRule);
      expect(
        readEsLintConfig(tree, `libs/lib1/${eslintConfigFile}`).overrides?.[0]
      ).toStrictEqual({
        files: ['*.ts', '*.tsx'],
        parserOptions: { project: ['libs/lib1/tsconfig*.json'] },
      });
    },
    timeout
  );

  it(
    'should apply import order',
    async () => {
      await lintingGenerator(tree, { importOrder: true });

      const eslintConfig = readEsLintConfig(tree);

      expect(eslintConfig.plugins?.includes('import')).toBeTruthy();
      expect(eslintConfig.overrides?.[0]).toStrictEqual(importOrderRule);
    },
    timeout
  );

  function addLibraries() {
    addProjectConfiguration(tree, 'lib1', {
      root: 'libs/lib1',
      sourceRoot: 'libs/lib1/src',
    });
    writeEsLintConfig(tree, {}, `libs/lib1/${eslintConfigFile}`);

    addProjectConfiguration(tree, 'lib2', {
      root: 'libs/lib2',
      sourceRoot: 'libs/lib2/src',
    });
  }
});

describe('@lantean/workspace prettier generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    writeEsLintConfig(tree, {});
  });

  it('should run successfully', async () => {
    await lintingGenerator(tree, { prettier: true });

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig).toBeDefined();
  });

  it('should provide a schematic', async () => {
    expect(typeof lintingSchematic({})).toBe('function');
  });

  it('should run successfully even if there was no previous prettier config', async () => {
    tree.delete(prettierConfigFile);

    await lintingGenerator(tree, { prettier: true });

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig).toBeDefined();
  });

  it('should run tasks', async () => {
    const tasks = await lintingGenerator(tree);
    console.log('tasks: ', tasks);

    expect(tasks).toBeTruthy();

    tasks?.();

    // expect(lintWorkspaceTask).toHaveBeenCalled();
    expect(installPackagesTask).toHaveBeenCalled();
    expect(formatWorkspaceTask).toHaveBeenCalled();
  });

  it('should add prettier to plugins', async () => {
    await lintingGenerator(tree, { prettier: true });

    const eslintConfig = readEsLintConfig(tree);
    expect(eslintConfig.plugins?.includes(prettierPlugin)).toBeTruthy();
  });

  it('should add prettier to overrides', async () => {
    await lintingGenerator(tree, { prettier: true });

    const eslintConfig = readEsLintConfig(tree);
    expect(eslintConfig.overrides?.[0].extends).toStrictEqual([
      'plugin:prettier/recommended',
    ]);
  });

  it('should add eslint prettier dev dependency', async () => {
    await lintingGenerator(tree, { prettier: true });

    const packageJson = readJson<JSONSchemaForNPMPackageJsonFiles>(
      tree,
      'package.json'
    );

    expect(packageJson.devDependencies?.[eslintPluginPrettier]).toBeDefined();
  });

  it('should set default prettier config', async () => {
    await lintingGenerator(tree, { prettier: true });

    const prettierConfig = readJson<Exclude<SchemaForPrettierrc, string>>(
      tree,
      prettierConfigFile
    );

    expect(prettierConfig.printWidth).toBe(prettierDefaultConfig.printWidth);
  });

  it('should be idempotent', async () => {
    await lintingGenerator(tree, { prettier: true });
    await lintingGenerator(tree, { prettier: true });

    const eslintConfig = readEsLintConfig(tree);

    expect(
      eslintConfig.plugins?.filter((plugin) => plugin === prettierPlugin).length
    ).toBe(1);
  });
});
