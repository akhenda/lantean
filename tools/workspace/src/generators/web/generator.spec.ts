import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, installPackagesTask, readProjectConfiguration } from '@nx/devkit';

import { webGenerator } from './generator';
import { WebGeneratorSchema } from './schema';

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  formatFiles: jest.fn(),
  installPackagesTask: jest.fn(),
}));

jest.mock('@nx/js', () => ({
  ...jest.requireActual('@nx/js'),
  libraryGenerator: jest.fn(),
}));

describe('web generator', () => {
  let tree: Tree;
  const options: WebGeneratorSchema = { uiName: 'ui-kit', utilsName: 'utils' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    tree.write('.vscode/settings.json', '{}');
    tree.write('libs/web/tsconfig.json', '{}');
    tree.write('libs/web/tsconfig.lib.json', '{}');
    tree.write('libs/web/tsconfig.spec.json', '{}');
    tree.write(
      'libs/web/project.json',
      JSON.stringify({ targets: { build: { options: {} } } }),
    );
  });

  it('should run successfully', async () => {
    const tasks = await webGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'web');

    expect(tasks).toBeTruthy();
    expect(installPackagesTask).not.toHaveBeenCalled();

    tasks();

    expect(config).toBeDefined();
    expect(installPackagesTask).toHaveBeenCalled();
  });
});
