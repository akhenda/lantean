export interface EnvGeneratorSchema {
  name?: string;
}

/**
 * The normalized options passed to the generator.
 */
export interface NormalizedSchema extends EnvGeneratorSchema {
  name: string;
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  importPath: string;
  libsDir: string;
  appsDir: string;
  parsedTags: string[];
}
