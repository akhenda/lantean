import { Tree } from '@nx/devkit';
import { createTree } from '@nx/devkit/testing';
import type { ESLint } from 'eslint';

import { addEsLintPlugin, isEsLintPluginPresent, readEsLintConfig, writeEsLintConfig } from './eslint-config';

const dummyESLintPlugin = {} as ESLint.Plugin;

describe('@lantean/workspace eslint-config', () => {
  let tree: Tree;
  const pluginName = 'plugin';
  const eslintConfigFile = 'eslint.config.js';

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
    tree = createTree();
  });

  describe('read configuration', () => {
    it('should create empty eslint config', () => {
      expect(readEsLintConfig(tree)).toStrictEqual({ root: true, ignorePatterns: ['**/*'] });
    });

    it('should read existing eslint config', () => {
      const eslintConfig = [{ ignores: ['**/*'] }];

      writeEsLintConfig(tree, eslintConfig);

      expect(readEsLintConfig(tree)).toStrictEqual(eslintConfig);
    });

    it('should read existing eslint config defined in another file', () => {
      const eslintConfig = [{ ignores: ['**/*'] }];
      writeEsLintConfig(tree, eslintConfig, eslintConfigFile);

      expect(readEsLintConfig(tree, eslintConfigFile)).toStrictEqual(eslintConfig);
    });
  });

  describe('manage plugins', () => {
    it('should check if plugin exists', () => {
      addEsLintPlugin(tree, pluginName, pluginName, '');

      expect(isEsLintPluginPresent(tree, pluginName)).toBeTruthy();
    });

    it('should check if plugin does not exist', () => {
      expect(isEsLintPluginPresent(tree, pluginName)).toBeFalsy();
    });

    it('should add a plugin', () => {
      const eslintConfig = [{ ignores: ['**/*'], plugins: {} }];

      writeEsLintConfig(tree, eslintConfig);
      addEsLintPlugin(tree, pluginName, pluginName, '');

      expect(isEsLintPluginPresent(tree, pluginName)).toBeTruthy();
    });

    it('should add a plugin at a specific location', () => {
      const eslintConfig = [{ ignores: ['**/*'], plugins: { existing: dummyESLintPlugin, last: dummyESLintPlugin } }];

      writeEsLintConfig(tree, eslintConfig);
      addEsLintPlugin(tree, pluginName, 'existing', '');

      expect(readEsLintConfig(tree)).toContain(['existing', pluginName, 'last']);
    });

    it('should add a plugin at the end if after does not exist', () => {
      const eslintConfig = [{ ignores: ['**/*'], plugins: {} }];

      writeEsLintConfig(tree, eslintConfig);
      addEsLintPlugin(tree, pluginName, 'non-existing', '');

      expect(isEsLintPluginPresent(tree, pluginName)).toBeTruthy();
    });

    it('should not add a plugin if already configured', () => {
      const eslintConfig = [{ ignores: ['**/*'], plugins: { [pluginName]: dummyESLintPlugin } }];

      writeEsLintConfig(tree, eslintConfig);
      addEsLintPlugin(tree, pluginName, pluginName, '');

      expect(readEsLintConfig(tree)).toContain([pluginName]);
    });
  });
});
