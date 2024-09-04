import { InitGeneratorSchema, NormalizedSchema } from './schema';
import { defaultLintStagedConfigFile } from './constants';

/**
 * Normalize options for the init generator.
 *
 * @param options The options passed to the generator.
 * @returns The normalized options.
 *
 * The normalized options include the following:
 * - `fileName`: The path to the lint-staged configuration file. If not provided, the default value is {@link defaultLintStagedConfigFile}.
 */
export function normalizeOptions(
  options: InitGeneratorSchema
): NormalizedSchema {
  const fileName = options ? options.configFileName : defaultLintStagedConfigFile;

  return { ...options, fileName };
}
