import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { typesGenerator } from './generator';
import { TypesGeneratorSchema } from './schema';

describe('types generator', () => {
  let tree: Tree;
  const options: TypesGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await typesGenerator(tree, options);

    const config = readProjectConfiguration(tree, 'test');

    expect(config).toBeDefined();
  });
});
