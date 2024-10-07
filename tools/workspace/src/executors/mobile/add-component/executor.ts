import { PromiseExecutor } from '@nx/devkit';

import { AddMobileComponentExecutorSchema } from './schema';
import { buildCommand, execPackageManagerCommand } from '../../../utils';

const runExecutor: PromiseExecutor<
  AddMobileComponentExecutorSchema
> = async (options, context) => {
  console.log('Executor ran for AddMobileComponent', options);
  if (!context.workspace) return { success: false };

  return execPackageManagerCommand(
    buildCommand([
      '@react-native-reusables/cli@latest add',
      (options.component ?? '').length === 0 ? '--all' : options.component,
      options.overwrite && '--overwrite',
    ]),
    {},
    'TS_NODE_PROJECT=tsconfig.base.json'
  );
};

export default runExecutor;
