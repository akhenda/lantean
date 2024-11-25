import { installPackagesTask, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import lintingGenerator from './generator';
import { prettierConfigFile } from './constants';
import { writeEsLintConfig, readEsLintConfig } from './eslint-config';

import { formatWorkspaceTask } from '../../devkit';

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
    writeEsLintConfig(tree, []);
  });

  it('should run successfully', async () => {
    await lintingGenerator(tree, {});

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig).toBeDefined();
  });

  it('should run tasks', async () => {
    const tasks = await lintingGenerator(tree, {});

    tasks();

    expect(installPackagesTask).toHaveBeenCalled();
  });
});

describe('@lantean/workspace prettier generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    writeEsLintConfig(tree, []);
  });

  it('should run successfully', async () => {
    await lintingGenerator(tree, { prettier: true });

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig).toBeDefined();
  });

  it('should run successfully even if there was no previous prettier config', async () => {
    tree.delete(prettierConfigFile);

    await lintingGenerator(tree, { prettier: true });

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig).toBeDefined();
  });

  it('should run tasks', async () => {
    const tasks = await lintingGenerator(tree);

    expect(tasks).toBeTruthy();

    tasks?.();

    // expect(lintWorkspaceTask).toHaveBeenCalled();
    expect(installPackagesTask).toHaveBeenCalled();
    expect(formatWorkspaceTask).toHaveBeenCalled();
  });
});
