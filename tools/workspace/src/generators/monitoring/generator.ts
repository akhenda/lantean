import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { MonitoringGeneratorSchema } from './schema';
import { generateMonitoringLib } from './tasks';

export async function monitoringGenerator(tree: Tree, options: MonitoringGeneratorSchema) {
  await generateMonitoringLib(tree, options);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
  };
}

export default monitoringGenerator;
