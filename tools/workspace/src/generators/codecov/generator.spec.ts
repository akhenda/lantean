import { NxJsonConfiguration, readJson, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import fetch from 'node-fetch-commonjs';
import { parse, stringify } from 'yaml';

import { getGitRepoSlug, nxConfigFile, readmeFile } from '../../devkit';

import { readCodecov, readRawCodecov } from './codecov';
import codecovGenerator, { ciValidateFile } from './generator';

jest.mock('node-fetch-commonjs');

jest.mock('../../devkit', () => ({
  ...jest.requireActual('../../devkit'),
  getGitRepoSlug: jest.fn(),
}));

const mockFetch = fetch as jest.Mock;
const mockGetGitRepoSlug = getGitRepoSlug as jest.Mock;

describe('@lantean/workspace codecov generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    mockFetch.mockResolvedValue({ ok: true });
    mockGetGitRepoSlug.mockReturnValue('test/test');

    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should run successfully', async () => {
    await codecovGenerator(tree);

    const codecov = readCodecov(tree);

    expect(codecov).toBeDefined();
  });

  it('should declare the implicit dependency in nx.json', async () => {
    await codecovGenerator(tree);

    const nxConfig = readJson<NxJsonConfiguration>(tree, nxConfigFile);

    expect(nxConfig.namedInputs).toStrictEqual({
      codecov: ['{workspaceRoot}/.codecov.yml'],
      default: ['codecov'],
    });
  });

  it('should add a badge in readme', async () => {
    tree.write(readmeFile, '# Readme\n');
    await codecovGenerator(tree);

    const readme = tree.read(readmeFile)?.toString() ?? '';

    expect(readme).toContain('[![codecov]');
  });

  it('should log error if can not resolve the git slug and add a badge', async () => {
    mockGetGitRepoSlug.mockReturnValue(null);

    await codecovGenerator(tree);

    expect(console.error).toHaveBeenCalledWith(
      `Could not add badge to README, remote repo could not be detected.`
    );
  });

  it('should log error if can not add step to GitHub workflow', async () => {
    await codecovGenerator(tree);

    expect(console.error).toHaveBeenCalledWith(
      `Codecov needs to be called from a CI pipeline, but it could not be found.`
    );
    expect(console.error).toHaveBeenCalledWith(
      `Try to generate it first using nx g @lantean/workspace:github`
    );
  });

  it('should add step to GitHub workflow', async () => {
    tree.write(ciValidateFile, stringify({ jobs: { 'run-nx-cloud': { steps: [] } } }));

    await codecovGenerator(tree);

    expect(
      parse(tree.read(ciValidateFile)?.toString() ?? '').jobs['run-nx-cloud'].steps
    ).toStrictEqual([
      {
        name: 'Codecov',
        uses: 'codecov/codecov-action@v3.1.0',
        if: `hashFiles('coverage/**/*') != ''`,
        with: { fail_ci_if_error: true, verbose: true },
      },
    ]);
  });

  it('should validate the generated codecov file', async () => {
    await codecovGenerator(tree);

    expect(fetch).toHaveBeenCalledWith(`https://api.codecov.io/validate`, {
      method: 'POST',
      body: readRawCodecov(tree),
    });
  });

  it('should validate the generated codecov file', async () => {
    mockFetch.mockResolvedValue({ ok: false });

    await expect(() => codecovGenerator(tree)).rejects.toEqual(
      new Error(`Couldn't generate a valid Codecov file`)
    );
  });
});
