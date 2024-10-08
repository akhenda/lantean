import { Tree } from '@nx/devkit';
import { createTree } from '@nx/devkit/testing';

import { gitMakeExecutable } from './git-make-executable';

import { exec } from '../exec';

jest.mock('../exec');

describe('@lantean/workspace devkit gitMakeExecutable', () => {
  let tree: Tree;
  const file = 'file.sh';

  beforeEach(() => {
    tree = createTree();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should execute git command', () => {
    (exec as jest.Mock).mockReturnValue({});

    expect(() => gitMakeExecutable(tree, file)).not.toThrow();
    expect(exec).toHaveBeenCalledWith(
      'git',
      ['update-index', '--chmod=+x', file],
      { cwd: '/virtual' }
    );
  });

  it('should throw error if exec fails', () => {
    (exec as jest.Mock).mockReturnValue({ error: '' });

    expect(() => gitMakeExecutable(tree, file)).toThrow(
      `Could not add execution permissions to git index for file: ${file}`
    );
  });
});
