import { ExecutorContext } from '@nx/devkit';

import { AddExecutorSchema } from './schema';
import executor from './executor';

const options: AddExecutorSchema = {};
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
};

describe('Add Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
