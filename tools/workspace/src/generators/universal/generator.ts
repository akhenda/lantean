import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { UniversalGeneratorSchema } from './schema';

export async function universalGenerator(
  tree: Tree,
  options: UniversalGeneratorSchema
) {
  const projectRoot = `libs/${options.uiName}`;

  addProjectConfiguration(tree, options.uiName, {
    root: projectRoot,
    projectType: 'library',
    sourceRoot: `${projectRoot}/src`,
    targets: {},
  });
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);

  await formatFiles(tree);
}

export default universalGenerator;
