import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { universalNextGenerator } from './generator';
import { UniversalNextGeneratorSchema } from './schema';

describe('universal-expo generator', () => {
  let tree: Tree;
  const options: UniversalNextGeneratorSchema = {
    name: 'test',
    displayName: 'Test',
    uiName: 'ui-kit-test',
    libName: 'lib-test',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await universalNextGenerator(tree, options);

    const config = readProjectConfiguration(tree, 'test');

    expect(config).toBeDefined();
  });
});
