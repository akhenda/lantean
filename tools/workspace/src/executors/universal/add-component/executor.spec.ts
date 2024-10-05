import { UniversalComponentAddExecutorSchema } from './schema';
import executor from './executor';
import * as utils from '../../../utils';

const options = {} as UniversalComponentAddExecutorSchema;
const context = utils.createFakeContext({
  workspaceRoot: '/root',
  cwd: process.cwd(),
  project: 'a',
  projectRoot: '/root/packages/a',
  additionalProjects: [
    { project: 'lib1', projectRoot: '/root/libs/lib1' },
    { project: 'lib2', projectRoot: '/root/libs/lib2' },
  ],
});

describe('UniversalComponentAdd Executor', () => {
  it('can run', async () => {
    jest
      .spyOn(utils, 'execCommand')
      .mockReturnValueOnce({ output: '', success: true });

    const output = await executor(options, context);

    expect(output?.success).toBe(true);
  });
});
