import { PromiseExecutor } from '@nx/devkit';

import { GluestackComponentAddExecutorSchema } from './schema';
import { buildCommand, execPackageManagerCommand } from '../../../utils';

const runExecutor: PromiseExecutor<
  GluestackComponentAddExecutorSchema
> = async (options, context) => {
  if (!context.workspace) return { success: false };

  return execPackageManagerCommand(
    buildCommand([
      'gluestack-ui@latest add',
      (options.component ?? '').length === 0 ? '--all' : options.component,
      options.overwrite && '--overwrite',
    ]),
    {}
  );
};

export default runExecutor;
