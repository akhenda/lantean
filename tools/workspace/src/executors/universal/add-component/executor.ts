import { PromiseExecutor } from '@nx/devkit';

import { UniversalComponentAddExecutorSchema } from './schema';
import { buildCommand, execPackageManagerCommand } from '../../../utils';

const runExecutor: PromiseExecutor<UniversalComponentAddExecutorSchema> = async (options, context) => {
  console.log('Executor ran for UniversalComponentAdd', { options, context });

  // https://github.com/koliveira15/nx-sonarqube/pull/117/files
  // https://github.com/nxkit/nxkit/pull/109
  if (!context.projectsConfigurations) return { success: false };

  return execPackageManagerCommand(
    buildCommand([
      '--bun',
      '@react-native-reusables/cli@latest',
      'add',
      options.component,
      options.overwrite && '--overwrite',
    ]),
    {},
    [`cp ./${options.projectRoot}/components.json components.json`, '&&', 'TS_NODE_PROJECT=tsconfig.base.json'],
    ['&&', 'rm components.json'],
  );
};

export default runExecutor;
