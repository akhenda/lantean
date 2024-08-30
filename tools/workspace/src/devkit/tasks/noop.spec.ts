import { noopTask } from './noop-task';

describe('@lantean/devkit noopTask', () => {
  it('should execute the task', () => {
    expect(noopTask()).toBeFalsy();
  });
});
