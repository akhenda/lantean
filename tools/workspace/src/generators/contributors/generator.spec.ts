import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { readmeFile, getGitRepoSlug } from '../../devkit';

import contributorsGenerator from './generator';

jest.mock('../../devkit', () => ({
  ...jest.requireActual('../../devkit'),
  getGitRepoSlug: jest.fn(),
}));

describe('@lantean/workspace contributors generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    tree.write(readmeFile, `# Repo\n\n`);
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
    (getGitRepoSlug as jest.Mock).mockReturnValue('test/test');
  });

  it('should run successfully', async () => {
    await contributorsGenerator(tree);
  });

  it('should fail if Readme does not exist', async () => {
    tree.delete(readmeFile);

    await expect(async () => await contributorsGenerator(tree)).rejects.toEqual(
      new Error(`Missing Readme file at: ${readmeFile}`)
    );
  });

  it('should fail if remote repo can not be resolved', async () => {
    (getGitRepoSlug as jest.Mock).mockReturnValue(null);

    await expect(async () => await contributorsGenerator(tree)).rejects.toEqual(
      new Error(`Remote repo could not be detected.`)
    );
  });

  it('should add the contributors section and image', async () => {
    await contributorsGenerator(tree);

    const readme = tree.read(readmeFile)?.toString() ?? '';

    expect(readme).toContain(`## Contributors`);
    expect(readme).toContain(`![contributors]`);
  });

  it('should not add the contributors section if already existing', async () => {
    await contributorsGenerator(tree);
    await contributorsGenerator(tree);

    expect(console.log).toHaveBeenCalledWith(`Contributors section already existing at: ${readmeFile}`);
  });
});
