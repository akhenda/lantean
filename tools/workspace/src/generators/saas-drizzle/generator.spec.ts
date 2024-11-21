import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { saasDrizzleGenerator } from './generator';
import { SaasDrizzleGeneratorSchema } from './schema';

describe('saas-drizzle generator', () => {
  let tree: Tree;
  const options: SaasDrizzleGeneratorSchema = {
    lintStagedConfigFileName: '.lintstagedrc.js',
    commitLintConfigFileName: '.commitlintrc.js',
    expoAppName: 'test',
    nextJSAppName: 'next',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await saasDrizzleGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
