import { PromiseExecutor } from '@nx/devkit';

import { AddMobileComponentExecutorSchema } from './schema';
import { buildCommand, execPackageManagerCommand } from '../../../utils';

const runExecutor: PromiseExecutor<AddMobileComponentExecutorSchema> = async (
  options,
  context,
) => {
  console.log('Executor ran for AddMobileComponent', options);
  if (!context.workspace) return { success: false };

  return execPackageManagerCommand(
    buildCommand([
      '@react-native-reusables/cli@latest add',
      options.component,
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
