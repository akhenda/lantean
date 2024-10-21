import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, installPackagesTask, readProjectConfiguration } from '@nx/devkit';

import { gluestackGenerator } from './generator';
import { GluestackGeneratorSchema } from './schema';

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  formatFiles: jest.fn(),
  installPackagesTask: jest.fn(),
}));

jest.mock('@nx/js', () => ({
  ...jest.requireActual('@nx/js'),
  libraryGenerator: jest.fn(),
}));

describe('gluestack generator', () => {
  let tree: Tree;
  const options: GluestackGeneratorSchema = { uiName: 'ui-kit', utilsName: 'utils' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    tree.write('.vscode/settings.json', '{}');
    tree.write('libs/gluestack/tsconfig.json', '{}');
    tree.write('libs/gluestack/tsconfig.lib.json', '{}');
    tree.write('libs/gluestack/tsconfig.spec.json', '{}');
    tree.write(
      'libs/gluestack/project.json',
      JSON.stringify({ targets: { build: { options: {} } } }),
    );
  });

  it('should run successfully', async () => {
    const tasks = await gluestackGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'gluestack');

    expect(tasks).toBeTruthy();
    expect(installPackagesTask).not.toHaveBeenCalled();

    tasks();

    expect(config).toBeDefined();
    expect(installPackagesTask).toHaveBeenCalled();
  });
});
