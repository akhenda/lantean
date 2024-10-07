import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, installPackagesTask, readProjectConfiguration } from '@nx/devkit';

import { mobileGenerator } from './generator';
import { MobileGeneratorSchema } from './schema';

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  formatFiles: jest.fn(),
  installPackagesTask: jest.fn(),
}));

jest.mock('@nx/js', () => ({
  ...jest.requireActual('@nx/js'),
  libraryGenerator: jest.fn(),
}));

describe('mobile generator', () => {
  let tree: Tree;
  const options: MobileGeneratorSchema = { uiName: 'ui-kit', utilsName: 'utils' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    tree.write('.vscode/settings.json', '{}');
    tree.write('libs/mobile/tsconfig.json', '{}');
    tree.write('libs/mobile/tsconfig.lib.json', '{}');
    tree.write('libs/mobile/tsconfig.spec.json', '{}');
    tree.write(
      'libs/mobile/project.json',
      JSON.stringify({ targets: { build: { options: {} } } }),
    );
  });

  it('should run successfully', async () => {
    const tasks = await mobileGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'mobile');

    expect(tasks).toBeTruthy();
    expect(installPackagesTask).not.toHaveBeenCalled();

    tasks();

    expect(config).toBeDefined();
    expect(installPackagesTask).toHaveBeenCalled();
  });
});
