import { PromiseExecutor } from '@nx/devkit';

import { WebComponentAddExecutorSchema } from './schema';
import { buildCommand, execPackageManagerCommand } from '../../../utils';

const runExecutor: PromiseExecutor<WebComponentAddExecutorSchema> = async (
  options,
  context,
) => {
  console.log('Executor ran for WebComponentAdd', options);
  if (!context.workspace) return { success: false };

  return execPackageManagerCommand(
    buildCommand([
      'shadcn@latest add',
      (options.component ?? '').length === 0 ? '--all' : options.component,
      options.overwrite && '--overwrite',
    ]),
    {},
    [
      `cp ./${options.projectRoot}/components.json components.json`,
      '&&',
      'TS_NODE_PROJECT=tsconfig.base.json',
    ],
    ['&&', 'rm components.json'],
  );
};

export default runExecutor;
