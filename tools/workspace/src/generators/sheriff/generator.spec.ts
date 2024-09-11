import { Tree, installPackagesTask } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { formatWorkspaceTask } from '../../devkit';

import { sheriffGenerator } from './generator';
import * as generatorTasks from './tasks';

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  formatFiles: jest.fn(),
  installPackagesTask: jest.fn(),
}));

jest.mock('@nx/js', () => ({
  ...jest.requireActual('@nx/js'),
  libraryGenerator: jest.fn(),
}));

jest.mock('../../devkit', () => ({
  ...jest.requireActual('../../devkit'),
  formatWorkspaceTask: jest.fn(),
}));

describe('sheriff generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });

    tree.write('/.eslintignore', 'ignore/me');
    tree.write('.vscode/settings.json', '{}');
    tree.write('libs/configs/eslint-config/package.json', '{}');
    tree.write('libs/configs/eslint-config/project.json', '{}');
    tree.write('libs/configs/eslint-config/.eslintrc.json', '{}');
    tree.write('libs/configs/eslint-config/tsconfig.lib.json', '{}');

    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should run successfully', async () => {
    jest.spyOn(generatorTasks, 'hasFlatConfig').mockReturnValueOnce(true);

    await sheriffGenerator(tree);
  });

  it('should run tasks', async () => {
    jest.spyOn(generatorTasks, 'hasFlatConfig').mockReturnValueOnce(true);

    const tasks = await sheriffGenerator(tree);

    expect(tasks).toBeTruthy();

    tasks();

    expect(generatorTasks.hasFlatConfig).toHaveBeenCalled();
    expect(installPackagesTask).toHaveBeenCalled();
    expect(formatWorkspaceTask).toHaveBeenCalled();
  });
});
