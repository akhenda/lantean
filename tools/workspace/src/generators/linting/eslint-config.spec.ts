import { Tree } from '@nx/devkit';
import { createTree } from '@nx/devkit/testing';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';

import {
  addEsLintPlugin,
  addEsLintRules,
  isEsLintPluginPresent,
  readEsLintConfig,
  writeEsLintConfig,
} from './eslint-config';
import { EsLintConfigurationOverrideRule } from './types';

describe('@lantean/workspace eslint-config', () => {
  let tree: Tree;
  const pluginName = 'plugin';
  const eslintConfigFile = 'eslintrc.json';

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
    tree = createTree();
  });

  describe('read configuration', () => {
    it('should create empty eslint config', () => {
      expect(readEsLintConfig(tree)).toStrictEqual({
        root: true,
        ignorePatterns: ['**/*'],
      });
    });

    it('should read existing eslint config', () => {
      const eslintConfig: JSONSchemaForESLintConfigurationFiles = {
        root: true,
        ignorePatterns: ['**/*'],
      };
      writeEsLintConfig(tree, eslintConfig);

      expect(readEsLintConfig(tree)).toStrictEqual(eslintConfig);
    });

    it('should read existing eslint config defined in another file', () => {
      const eslintConfig: JSONSchemaForESLintConfigurationFiles = {
        root: true,
        ignorePatterns: ['**/*'],
      };
      writeEsLintConfig(tree, eslintConfig, eslintConfigFile);

      expect(readEsLintConfig(tree, eslintConfigFile)).toStrictEqual(
        eslintConfig
      );
    });
  });

  describe('manage plugins', () => {
    it('should check if plugin exists', () => {
      addEsLintPlugin(tree, pluginName);

      expect(isEsLintPluginPresent(tree, pluginName)).toBeTruthy();
    });

    it('should check if plugin does not exist', () => {
      expect(isEsLintPluginPresent(tree, pluginName)).toBeFalsy();
    });

    it('should add a plugin', () => {
      const eslintConfig: JSONSchemaForESLintConfigurationFiles = {
        root: true,
        ignorePatterns: ['**/*'],
        plugins: [],
      };

      writeEsLintConfig(tree, eslintConfig);
      addEsLintPlugin(tree, pluginName);

      expect(isEsLintPluginPresent(tree, pluginName)).toBeTruthy();
    });

    it('should add a plugin at a specific location', () => {
      const eslintConfig: JSONSchemaForESLintConfigurationFiles = {
        root: true,
        ignorePatterns: ['**/*'],
        plugins: ['existing', 'last'],
      };

      writeEsLintConfig(tree, eslintConfig);
      addEsLintPlugin(tree, pluginName, 'existing');

      expect(readEsLintConfig(tree).plugins).toStrictEqual([
        'existing',
        pluginName,
        'last',
      ]);
    });

    it('should add a plugin at the end if after does not exist', () => {
      const eslintConfig: JSONSchemaForESLintConfigurationFiles = {
        root: true,
        ignorePatterns: ['**/*'],
        plugins: [],
      };

      writeEsLintConfig(tree, eslintConfig);
      addEsLintPlugin(tree, pluginName, 'non-existing');

      expect(isEsLintPluginPresent(tree, pluginName)).toBeTruthy();
    });

    it('should not add a plugin if already configured', () => {
      const eslintConfig: JSONSchemaForESLintConfigurationFiles = {
        root: true,
        ignorePatterns: ['**/*'],
        plugins: [pluginName],
      };

      writeEsLintConfig(tree, eslintConfig);
      addEsLintPlugin(tree, pluginName);

      expect(readEsLintConfig(tree).plugins).toStrictEqual([pluginName]);
    });
  });

  describe('manage rules', () => {
    const basicRule: EsLintConfigurationOverrideRule = {
      files: '*.js',
      rules: { rule1: 'off' },
    };
    const newRule: EsLintConfigurationOverrideRule = {
      files: '*.js',
      rules: { rule2: 'off' },
    };
    const differentFileRule: EsLintConfigurationOverrideRule = {
      files: '*.md',
      rules: { rule: 'off' },
    };

    const preset = 'preset';
    const parserOptions = { tsConfig: 'tsconfig.json' };
    const settings = { setting: true };

    it('add override rule', () => {
      addEsLintRules(tree, basicRule);

      expect(readEsLintConfig(tree).overrides).toStrictEqual([basicRule]);
    });

    it('add override rule if others already existing', () => {
      const eslintConfig: JSONSchemaForESLintConfigurationFiles = {
        root: true,
        ignorePatterns: ['**/*'],
        overrides: [differentFileRule],
      };

      writeEsLintConfig(tree, eslintConfig);
      addEsLintRules(tree, basicRule);

      expect(readEsLintConfig(tree).overrides).toStrictEqual([
        differentFileRule,
        basicRule,
      ]);
    });

    it('merge rules by file', () => {
      const eslintConfig: JSONSchemaForESLintConfigurationFiles = {
        root: true,
        ignorePatterns: ['**/*'],
        overrides: [basicRule],
      };

      writeEsLintConfig(tree, eslintConfig);
      addEsLintRules(tree, newRule);

      expect(readEsLintConfig(tree).overrides).toStrictEqual([
        { files: '*.js', rules: { rule1: 'off', rule2: 'off' } },
      ]);
    });

    it('merge extends property of rule', () => {
      const eslintConfig: JSONSchemaForESLintConfigurationFiles = {
        root: true,
        ignorePatterns: ['**/*'],
        overrides: [{ ...basicRule, extends: [preset] }],
      };

      writeEsLintConfig(tree, eslintConfig);
      addEsLintRules(tree, newRule);

      expect(readEsLintConfig(tree).overrides).toStrictEqual([
        {
          files: '*.js',
          rules: { rule1: 'off', rule2: 'off' },
          extends: [preset],
        },
      ]);
    });

    it('merge extends property of rule ignoring duplicates', () => {
      const eslintConfig: JSONSchemaForESLintConfigurationFiles = {
        root: true,
        ignorePatterns: ['**/*'],
        overrides: [{ ...basicRule, extends: [preset] }],
      };

      writeEsLintConfig(tree, eslintConfig);
      addEsLintRules(tree, { ...newRule, extends: [preset] });

      expect(readEsLintConfig(tree).overrides).toStrictEqual([
        {
          files: '*.js',
          rules: { rule1: 'off', rule2: 'off' },
          extends: [preset],
        },
      ]);
    });

    it('merge extends property of rule when not previously existing', () => {
      const eslintConfig: JSONSchemaForESLintConfigurationFiles = {
        root: true,
        ignorePatterns: ['**/*'],
        overrides: [basicRule],
      };

      writeEsLintConfig(tree, eslintConfig);
      addEsLintRules(tree, { ...newRule, extends: [preset] });

      expect(readEsLintConfig(tree).overrides).toStrictEqual([
        {
          files: '*.js',
          rules: { rule1: 'off', rule2: 'off' },
          extends: [preset],
        },
      ]);
    });

    it('merge parserOptions property of rule', () => {
      const eslintConfig: JSONSchemaForESLintConfigurationFiles = {
        root: true,
        ignorePatterns: ['**/*'],
        overrides: [{ ...basicRule, parserOptions }],
      };

      writeEsLintConfig(tree, eslintConfig);
      addEsLintRules(tree, newRule);

      expect(readEsLintConfig(tree).overrides).toStrictEqual([
        { files: '*.js', rules: { rule1: 'off', rule2: 'off' }, parserOptions },
      ]);
    });

    it('merge settings property of rule', () => {
      const eslintConfig: JSONSchemaForESLintConfigurationFiles = {
        root: true,
        ignorePatterns: ['**/*'],
        overrides: [basicRule],
      };

      writeEsLintConfig(tree, eslintConfig);
      addEsLintRules(tree, { ...newRule, settings });

      expect(readEsLintConfig(tree).overrides).toStrictEqual([
        { files: '*.js', rules: { rule1: 'off', rule2: 'off' }, settings },
      ]);
    });
  });
});
