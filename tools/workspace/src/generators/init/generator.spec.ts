import { Tree, installPackagesTask, readJson, writeJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import {
  addDevDependencyToPackageJson,
  addHuskyHook,
  addHuskyToPackageJson,
  installHuskyTask,
} from '../../devkit';
import * as utils from '../../utils';

import lintStagedGenerator from './generator';

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  installPackagesTask: jest.fn(),
}));

jest.mock('../../devkit', () => ({
  ...jest.requireActual('../../devkit'),
  addDevDependencyToPackageJson: jest.fn(),
  addHuskyToPackageJson: jest.fn(),
  addHuskyHook: jest.fn(),
  installHuskyTask: jest.fn(),
}));

describe('@nx-squeezer/workspace lint-staged generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should run successfully', async () => {
    await lintStagedGenerator(tree);
  });

  it('should add dependencies', async () => {
    await lintStagedGenerator(tree);

    expect(addHuskyToPackageJson).toHaveBeenCalled();
    expect(addDevDependencyToPackageJson).toHaveBeenCalledWith(
      tree,
      'lint-staged'
    );
  });

  it('should add husky hook', async () => {
    jest.spyOn(utils, 'isHuskyInstalled').mockReturnValueOnce(true);

    await lintStagedGenerator(tree);

    expect(addHuskyHook).toHaveBeenCalledWith(
      tree,
      'pre-commit',
      'npx lint-staged --concurrent false --relative'
    );
  });

  it('should create lint-staged config', async () => {
    const configFileName = '.lintstagedrc';

    await lintStagedGenerator(tree, { configFileName });

    expect(readJson(tree, configFileName)).toMatchSnapshot();
  });

  it('should merge lint-staged config', async () => {
    const configFileName = '.lintstagedrc';
    const mdFormat = { '*.md': 'markdown --format' };

    writeJson(tree, configFileName, mdFormat);

    await lintStagedGenerator(tree, { configFileName });

    expect(readJson(tree, configFileName)).toMatchSnapshot();
  });

  it('should run tasks', async () => {
    jest.spyOn(utils, 'isHuskyInstalled').mockReturnValueOnce(false);

    const tasks = await lintStagedGenerator(tree);

    expect(tasks).toBeTruthy();

    tasks?.();

    expect(utils.isHuskyInstalled).toHaveBeenCalled();
    expect(installPackagesTask).toHaveBeenCalled();
    expect(installHuskyTask).toHaveBeenCalled();
    expect(addHuskyHook).not.toHaveBeenCalled();
  });
});
