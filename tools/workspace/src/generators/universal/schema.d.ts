/**
 * The options passed to the generator.
 */
export interface UniversalGeneratorSchema {
  uiName: string
  utilsName: string
}

/**
 * The normalized options passed to the generator.
 */
export interface NormalizedSchema extends UniversalGeneratorSchema {
  name: string;
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  importPath: string;
  libsDir: string;
  appsDir: string;
  uiTags: string[];
  utilsTags: string[];
}
