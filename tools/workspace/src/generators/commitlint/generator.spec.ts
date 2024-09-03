import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { commitlintGenerator } from './generator';
import { CommitlintGeneratorSchema } from './schema';

describe('commitlint generator', () => {
  let tree: Tree;
  const options: CommitlintGeneratorSchema = { configFileName: '.commitlintrc' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await commitlintGenerator(tree, options);

    const config = readProjectConfiguration(tree, 'test');

    expect(config).toBeDefined();
  });
});
