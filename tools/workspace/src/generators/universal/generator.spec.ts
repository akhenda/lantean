import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, installPackagesTask, readProjectConfiguration } from '@nx/devkit';

import { universalGenerator } from './generator';
import { UniversalGeneratorSchema } from './schema';

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  formatFiles: jest.fn(),
  installPackagesTask: jest.fn(),
}));

jest.mock('@nx/js', () => ({
  ...jest.requireActual('@nx/js'),
  libraryGenerator: jest.fn(),
}));

describe('universal generator', () => {
  let tree: Tree;
  const options: UniversalGeneratorSchema = { uiName: 'ui-kit', utilsName: 'utils' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    tree.write('.vscode/settings.json', '{}');
    tree.write('libs/universal/tsconfig.json', '{}');
    tree.write('libs/universal/tsconfig.lib.json', '{}');
    tree.write('libs/universal/tsconfig.spec.json', '{}');
    tree.write(
      'libs/universal/project.json',
      JSON.stringify({ targets: { build: { options: {} } } }),
    );
  });

  it('should run successfully', async () => {
    const tasks = await universalGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'universal');

    expect(tasks).toBeTruthy();
    expect(installPackagesTask).not.toHaveBeenCalled();

    tasks();

    expect(config).toBeDefined();
    expect(installPackagesTask).toHaveBeenCalled();
  });
});
