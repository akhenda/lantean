/**
 * The options passed to the generator.
 */
export interface UniversalGeneratorSchema {
  uiName: string;
  utilsName: string;
}

/**
 * The normalized options passed to the generator.
 */
export interface NormalizedSchema extends UniversalGeneratorSchema {
  name: string;
  ui: string;
  utils: string;
  npmScope: string;
  npmScopeTitle: string;
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  importPath: string;
  libsDir: string;
  appsDir: string;
  uiTags: string[];
  utilsTags: string[];

  designPath: string;
  designRoot: string;
  featuresPath: string;
  featuresRoot: string;
  hooksPath: string;
  hooksRoot: string;
  providersPath: string;
  providersRoot: string;
  storesPath: string;
  storesRoot: string;
  utilsPath: string;
  utilsRoot: string;
}
