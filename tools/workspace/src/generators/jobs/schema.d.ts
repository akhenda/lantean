export interface JobsGeneratorSchema {
  name: string;
}

/**
 * The normalized options passed to the generator.
 */
export interface NormalizedSchema extends JobsGeneratorSchema {
  /**
   * The name of the library.
   */
  name: string;

  /**
   * The name of the project.
   */
  projectName: string;

  /**
   * The path to the project root.
   */
  projectRoot: string;

  /**
   * The path to the project directory.
   */
  projectDirectory: string;

  /**
   * The import path for the library.
   */
  importPath: string;

  /**
   * The path to the apps directory.
   */
  libsDir: string;

  /**
   * The path to the libs directory.
   */
  appsDir: string;

  /**
   * The parsed tags for the project.
   */
  parsedTags: string[];

  /**
   * The npm scope for the library.
   */
  npmScope: string;

  /**
   * The title cased npm scope for the library.
   */
  npmScopeTitle: string;

  /**
   * The relative path from the workspace root to the library.
   */
  offsetFromRoot: string;
}
