import { NxJsonConfiguration, readJson, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { parse } from 'yaml';

import {
  getGitRepo,
  nxConfigFile,
  readmeFile,
  readPackageJson,
  existsGitHubCiWorkflow,
} from '../../devkit';

import gitHubWorkflowGenerator from './generator';
import { ciMergeWorkflowPath } from './constants';

jest.mock('../../devkit', () => ({
  ...jest.requireActual('../../devkit'),
  getGitRepo: jest.fn(),
}));

describe('@lantean/workspace github workflow generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
    (getGitRepo as jest.Mock).mockReturnValue('https://github.com/test/test');
  });

  it('should run successfully', async () => {
    await gitHubWorkflowGenerator(tree, {
      branch: 'main',
      useNxCloud: true,
      force: true,
      packageManager: 'bun',
    });

    expect(existsGitHubCiWorkflow(tree, ciMergeWorkflowPath)).toBeTruthy();
  });

  it('should skip execution if a GitHub CI workflow already exists', async () => {
    tree.write(ciMergeWorkflowPath, '');

    await gitHubWorkflowGenerator(tree, {
      branch: 'main',
      useNxCloud: true,
      force: false,
      packageManager: 'bun',
    });

    expect(console.log).toHaveBeenCalledWith(
      `GitHub workflow already existing at path: ${ciMergeWorkflowPath}`
    );
  });

  it('should not skip execution if a GitHub CI workflow already exists but passing force option', async () => {
    tree.write(ciMergeWorkflowPath, '');

    await gitHubWorkflowGenerator(tree, {
      branch: 'main',
      useNxCloud: true,
      force: true,
      packageManager: 'bun',
    });

    expect(tree.read(ciMergeWorkflowPath)?.toString()).toBeTruthy();
  });

  it('should generate the GitHub CI workflow', async () => {
    await gitHubWorkflowGenerator(tree, {
      branch: 'main',
      useNxCloud: true,
      force: true,
      packageManager: 'bun',
    });

    const ci = parse(tree.read(ciMergeWorkflowPath)?.toString() ?? '');

    expect(ci).toMatchSnapshot();
  });

  it('should declare the nx script in package.json', async () => {
    await gitHubWorkflowGenerator(tree, {
      branch: 'main',
      useNxCloud: true,
      force: true,
      packageManager: 'bun',
    });

    const packageJson = readPackageJson(tree);

    expect(packageJson.scripts?.nx).toBe('nx');
  });

  it('should declare the implicit dependency in nx.json', async () => {
    await gitHubWorkflowGenerator(tree, {
      branch: 'main',
      useNxCloud: true,
      force: true,
      packageManager: 'bun',
    });

    const nxConfig = readJson<NxJsonConfiguration>(tree, nxConfigFile);

    expect(nxConfig.namedInputs).toStrictEqual({
      ci: ['{workspaceRoot}/.github/workflows/*.yml'],
      default: ['ci'],
    });
  });

  it('should add a badge in readme', async () => {
    tree.write(readmeFile, '# Readme\n');
    await gitHubWorkflowGenerator(tree, {
      branch: 'main',
      useNxCloud: true,
      force: true,
      packageManager: 'bun',
    });

    const readme = tree.read(readmeFile)?.toString() ?? '';

    expect(readme).toContain('[![CI]');
  });

  it('should not add a badge in readme if repo can not be resolved', async () => {
    (getGitRepo as jest.Mock).mockReturnValue(null);
    tree.write(readmeFile, '# Readme\n');
    await gitHubWorkflowGenerator(tree, {
      branch: 'main',
      useNxCloud: true,
      force: true,
      packageManager: 'bun',
    });

    const readme = tree.read(readmeFile)?.toString() ?? '';

    expect(readme).not.toContain('[![CI]');
    expect(console.error).toHaveBeenCalledWith(
      `Could not add badge to README, remote repo could not be detected.`
    );
  });
});
