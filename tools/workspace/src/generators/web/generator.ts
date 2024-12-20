import { formatFiles, installPackagesTask, Tree } from '@nx/devkit';

import { WebGeneratorSchema } from './schema';
import { generateWebLib, updatePrettierConfig } from './tasks';
import { normalizeOptions } from './utils';

/**
 * Sets up a Web Design System (WDS) using shadcn/ui
 *
 * @param tree The abstract syntax tree of the workspace.
 * @param schema The options passed to the generator.
 *
 * @returns A function that will install the required packages and
 * format the workspace.
 */
export async function webGenerator(tree: Tree, schema: WebGeneratorSchema) {
  const options = normalizeOptions(tree, schema);

  await generateWebLib(tree, options);

  /**
   * Breaks on Prettier v2
   *
   * https://github.com/tailwindlabs/prettier-plugin-tailwindcss/issues/207#issuecomment-1698071122
   *
   * TODO(akhenda): Enable later when Prettier v3 is standard
   */
  await formatFiles(tree);

  // We need to call this after we format the files otherwise prettier
  // will fail since the tailwind plugin is not yet installed
  updatePrettierConfig(tree);

  return () => {
    installPackagesTask(tree);
  };
}

export default webGenerator;
