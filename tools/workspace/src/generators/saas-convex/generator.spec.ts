import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { saasConvexGenerator } from './generator';
import { SaasConvexGeneratorSchema } from './schema';

describe('saas-convex generator', () => {
  let tree: Tree;
  const options: SaasConvexGeneratorSchema = {
    lintStagedConfigFileName: '.lintstagedrc.js',
    commitLintConfigFileName: '.commitlintrc.js',
    expoAppName: 'test',
    nextJSAppName: 'next',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await saasConvexGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
