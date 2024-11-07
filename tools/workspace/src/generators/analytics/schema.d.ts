export interface AnalyticsGeneratorSchema {
  name: string;
  loggingLibName: string;
  typesLibName: string;
  skipFormat: boolean;
}

/**
 * The normalized options passed to the generator.
 */
export interface NormalizedSchema extends AnalyticsGeneratorSchema {
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

  /**
   * The name of the logging library.
   */
  loggingLibName: string;

  /**
   * The import path for the logging library.
   */
  loggingLibImportPath: string;

  /**
   * The name of the types library.
   */
  typesLibName: string;

  /**
   * The import path for the types library.
   */
  typesLibImportPath: string;
}