import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { readProjectConfiguration } from '@nx/devkit';
import type { Tree } from '@nx/devkit';

import { convexGenerator } from './generator';
import { ConvexGeneratorSchema } from './schema';

/**
 * Prettier ESM Error
 *
 * https://github.com/nrwl/nx/issues/22948
 * https://github.com/nrwl/nx/issues/26387
 */
jest.mock('prettier', () => null);

describe('convex generator', () => {
  let tree: Tree;
  const options: ConvexGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await convexGenerator(tree, options);

    const config = readProjectConfiguration(tree, 'test');

    expect(config).toBeDefined();
  });

  describe('snapshots', () => {
    it('should generate files', async () => {
      await convexGenerator(tree, options);

      expect(tree.read('convex.json', 'utf-8')).toMatchSnapshot();
      expect(tree.read(`${options.name}/.eslintrc.json`, 'utf-8')).toMatchSnapshot();
      expect(tree.read(`${options.name}/tsconfig.json`, 'utf-8')).toMatchSnapshot();
      expect(tree.read(`${options.name}/tsconfig.lib.json`, 'utf-8')).toMatchSnapshot();
      expect(tree.read(`${options.name}/tsconfig.spec.json`, 'utf-8')).toMatchSnapshot();
      expect(tree.read(`${options.name}/vite.config.ts`, 'utf-8')).toMatchSnapshot();
    });
  });
});
