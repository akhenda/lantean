/* eslint-disable @typescript-eslint/no-empty-interface */

/**
 * @ignore
 */
export interface SheriffGeneratorSchema {}

/**
 * The normalized options passed to the generator.
 */
export interface NormalizedSchema extends SheriffGeneratorSchema {
  name: string;
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  importPath: string;
  libsDir: string;
  appsDir: string;
  parsedTags: string[];
}
