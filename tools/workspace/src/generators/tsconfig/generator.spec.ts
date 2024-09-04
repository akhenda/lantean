import { Tree, readJson } from '@nx/devkit';
import { createTree, createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';

import { lintWorkspaceTask } from '../../devkit';

import tsConfigGenerator, { defaultTSConfig, tsConfigFile } from './generator';

jest.mock('../../devkit', () => ({
  ...jest.requireActual('../../devkit'),
  lintWorkspaceTask: jest.fn(),
}));

describe('@lantean/workspace tsconfig generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should run successfully', async () => {
    await tsConfigGenerator(tree);

    const tsConfig = readJson<TSConfig>(tree, tsConfigFile);

    expect(tsConfig).toBeDefined();
  });

  it('should skip execution if tsconfig file does not exist', async () => {
    tree = createTree();

    await tsConfigGenerator(tree);

    expect(tree.exists(tsConfigFile)).toBeFalsy();
    expect(console.error).toHaveBeenCalledWith(`File ${tsConfigFile} not found.`);
  });

  it('should run tasks', async () => {
    const tasks = await tsConfigGenerator(tree);

    expect(tasks).toBeTruthy();

    tasks?.();

    expect(lintWorkspaceTask).toHaveBeenCalled();
  });

  it('should set compiler options', async () => {
    await tsConfigGenerator(tree);

    const tsConfig = readJson<TSConfig>(tree, tsConfigFile);

    for (const compilerOption in defaultTSConfig.compilerOptions) {
      expect(tsConfig.compilerOptions?.[compilerOption]).toBe(defaultTSConfig.compilerOptions[compilerOption]);
    }
  });
});
