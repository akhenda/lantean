import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { universalGenerator } from './generator';
import { UniversalGeneratorSchema } from './schema';

describe('universal generator', () => {
  let tree: Tree;
  const options: UniversalGeneratorSchema = { uiName: 'ui-kit', utilsName: 'utils' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await universalGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'ui-kit');
    expect(config).toBeDefined();
  });
});
