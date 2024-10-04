import { WebComponentAddExecutorSchema } from './schema';
import executor from './executor';
import { createFakeContext } from '../../../utils';

const options = {} as WebComponentAddExecutorSchema;
const context = createFakeContext({
  workspaceRoot: '/root',
  cwd: process.cwd(),
  project: 'a',
  projectRoot: '/root/packages/a',
  additionalProjects: [
    { project: 'lib1', projectRoot: '/root/libs/lib1' },
    { project: 'lib2', projectRoot: '/root/libs/lib2' },
  ],
});

describe('WebComponentAdd Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);

    expect(output?.success).toBe(true);
  });
});
