import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { universalExpoGenerator } from './generator';
import { UniversalExpoGeneratorSchema } from './schema';

describe('universal-expo generator', () => {
  let tree: Tree;
  const options: UniversalExpoGeneratorSchema = {
    name: 'test',
    displayName: 'Test',
    uiName: 'ui-kit-test',
    libName: 'lib-test',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await universalExpoGenerator(tree, options);

    const config = readProjectConfiguration(tree, 'test');

    expect(config).toBeDefined();
  });
});
