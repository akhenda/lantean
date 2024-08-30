import { noopTask } from './noop-task';

describe('@lantean/workspace devkit noopTask', () => {
  it('should execute the task', () => {
    expect(noopTask()).toBeFalsy();
  });
});
