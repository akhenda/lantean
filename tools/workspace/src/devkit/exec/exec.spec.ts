import { execFileSync } from 'child_process';

import { sync } from 'which';

import { exec } from './exec';

jest.mock('child_process');
jest.mock('which');

describe('@lantean/workspace devkit exec', () => {
  const output = 'output';

  it('should execute command without cwd', () => {
    (execFileSync as jest.Mock).mockReturnValue(output);
    (sync as jest.Mock).mockReturnValue('npm');

    expect(exec('npm', ['run', 'test'])).toStrictEqual({ output });
    expect(execFileSync).toHaveBeenCalledWith('npm', ['run', 'test'], { cwd: undefined, shell: true });
  });

  it('should execute command with cwd', () => {
    (execFileSync as jest.Mock).mockReturnValue(output);
    (sync as jest.Mock).mockReturnValue('npm');

    expect(exec('npm', ['run', 'test'], { cwd: 'folder' })).toStrictEqual({ output });
    expect(execFileSync).toHaveBeenCalledWith('npm', ['run', 'test'], { cwd: 'folder', shell: true });
  });

  it('should execute command with cwd as an array', () => {
    (execFileSync as jest.Mock).mockReturnValue(output);
    (sync as jest.Mock).mockReturnValue('npm');

    expect(exec('npm', ['run', 'test'], { cwd: ['folder', 'subfolder'] })).toStrictEqual({ output });
    expect(execFileSync).toHaveBeenCalledWith('npm', ['run', 'test'], { cwd: 'folder/subfolder', shell: true });
  });

  it('should catch errors', () => {
    (execFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('error');
    });
    (sync as jest.Mock).mockReturnValue('npm');
    jest.spyOn(console, 'error').mockImplementation(() => void {});

    expect(exec('npm', ['run', 'test'])).toStrictEqual({ output: '', error: new Error('error') });
    expect(execFileSync).toHaveBeenCalledWith('npm', ['run', 'test'], { cwd: undefined, shell: true });
    expect(console.error).toHaveBeenCalledWith(new Error('error'));
  });

  it('should catch string errors', () => {
    (execFileSync as jest.Mock).mockImplementation(() => {
      throw 'error';
    });
    (sync as jest.Mock).mockReturnValue('npm');
    jest.spyOn(console, 'error').mockImplementation(() => void {});

    expect(exec('npm', ['run', 'test'])).toStrictEqual({ output: '', error: new Error('error') });
    expect(execFileSync).toHaveBeenCalledWith('npm', ['run', 'test'], { cwd: undefined, shell: true });
    expect(console.error).toHaveBeenCalledWith(new Error('error'));
  });
});
