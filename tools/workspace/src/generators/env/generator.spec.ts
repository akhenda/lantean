import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree } from '@nx/devkit';

import { envGenerator } from './generator';
import { EnvGeneratorSchema } from './schema';

jest.mock('@nx/js', () => ({
  ...jest.requireActual('@nx/js'),
  libraryGenerator: jest.fn(),
}));

describe('env generator', () => {
  let tree: Tree;
  const options: EnvGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    tree.write(`libs/configs/${options.name}/package.json`, '{}');
    tree.write(`libs/configs/${options.name}/.eslintrc.json`, '{}');
    tree.write(`libs/configs/${options.name}/tsconfig.json`, '{}');
    tree.write(`libs/configs/${options.name}/tsconfig.lib.json`, '{}');
    tree.write(`libs/configs/${options.name}/tsconfig.spec.json`, '{}');
    tree.write(
      `libs/configs/${options.name}/project.json`,
      JSON.stringify({ targets: { build: { options: {} } } }),
    );
  });

  it('should run successfully', async () => {
    await envGenerator(tree, options);
  });
});
