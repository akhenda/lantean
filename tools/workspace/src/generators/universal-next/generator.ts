import { formatFiles, installPackagesTask, readProjectConfiguration, Tree } from '@nx/devkit';

import { UniversalNextGeneratorSchema } from './schema';
import { generateNextUniversalApp } from './tasks';
import { normalizeOptions } from './utils';

import { joinNormalize } from '../../devkit';

import universalGenerator from '../universal/generator';
import { installAFewUniversalComponents } from '../universal/tasks';
import { updateEsLintProjectConfig } from '../linting/eslint-config';

/**
 * Sets up a Universal Design System (UDS) using Next.js.
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param schema The options passed to the generator.
 *
 * @returns A function that will install the required packages and
 * format the workspace.
 */
export async function universalNextGenerator(tree: Tree, schema: UniversalNextGeneratorSchema) {
  const skipFormat = false;
  const options = normalizeOptions(tree, { ...schema, skipFormat: schema.skipFormat ?? skipFormat });
  const { universalLibName, uiName, libName } = options;

  try {
    readProjectConfiguration(tree, universalLibName);
  } catch (error) {
    console.error(error?.message);

    await universalGenerator(tree, { uiName, libName, skipFormat });
  }

  await generateNextUniversalApp(tree, options);

  updateEsLintProjectConfig(tree, (project) => ({
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: [joinNormalize(project.root, 'tsconfig*.json')] },
    },
  }));

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    installAFewUniversalComponents(universalLibName);
  };
}

export default universalNextGenerator;
