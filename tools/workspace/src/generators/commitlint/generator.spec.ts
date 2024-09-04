import {
  addDependenciesToPackageJson,
  installPackagesTask,
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { addHuskyHook, getGitRepo } from '../../devkit';
import * as utils from '../../utils';

import { devDependencies } from './constants';
import commitlintGenerator from './generator';

jest.mock('../../devkit', () => ({
  ...jest.requireActual('../../devkit'),
  addHuskyHook: jest.fn(),
  getGitRepo: jest.fn(),
}));

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  installPackagesTask: jest.fn(),
  addDependenciesToPackageJson: jest.fn(),
}));

const mockGetGitRepo = getGitRepo as jest.Mock;

describe('@lantean/workspace commitlint generator', () => {
  let tree: Tree;
  const gitRepo = 'https://github.com/akhenda/lantean';

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should run successfully', async () => {
    await commitlintGenerator(tree);
  });

  it('should add dependencies', async () => {
    await commitlintGenerator(tree);

    expect(addDependenciesToPackageJson).toHaveBeenCalledWith(
      tree,
      {},
      devDependencies
    );
  });

  it('should add husky hook', async () => {
    jest.spyOn(utils, 'isHuskyInstalled').mockReturnValueOnce(true);

    await commitlintGenerator(tree);

    expect(addHuskyHook).toHaveBeenCalledWith(
      tree,
      'commit-msg',
      'npx --no-install commitlint --edit $1'
    );
  });

  it('should create commitlint config', async () => {
    const configFileName = '.commitlintrc';
    await commitlintGenerator(tree, { configFileName });

    expect(readJson(tree, configFileName)).toMatchSnapshot();
  });

  it('should merge commitlint config', async () => {
    const configFileName = '.commitlintrc.json';
    const commitlintEmpty = { extends: [], rules: {} };

    mockGetGitRepo.mockReturnValue(gitRepo);

    writeJson(tree, configFileName, commitlintEmpty);

    await commitlintGenerator(tree, { configFileName });

    expect(readJson(tree, configFileName)).toMatchSnapshot();
  });

  it('should run tasks', async () => {
    jest.spyOn(utils, 'isHuskyInstalled').mockReturnValueOnce(false);

    const tasks = await commitlintGenerator(tree);

    expect(tasks).toBeTruthy();

    tasks?.();

    expect(utils.isHuskyInstalled).toHaveBeenCalled();
    expect(installPackagesTask).toHaveBeenCalled();
    expect(addHuskyHook).not.toHaveBeenCalled();
  });
});
