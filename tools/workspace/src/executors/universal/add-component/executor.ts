import { PromiseExecutor } from '@nx/devkit';

import { UniversalComponentAddExecutorSchema } from './schema';
import { buildCommand, execPackageManagerCommand } from '../../../utils';

const runExecutor: PromiseExecutor<
  UniversalComponentAddExecutorSchema
> = async (options, context) => {
  if (!context.workspace) return { success: false };

  const { root } = context.workspace.projects[context.projectName];

  return execPackageManagerCommand(
    buildCommand([
      'shadcn@latest add',
      (options.component ?? '').length === 0 ? '--all' : options.component,
      options.overwrite && '--overwrite',
      '--path=src',
      `--cwd=${root}`,
    ]),
    {}
  );
};

export default runExecutor;
