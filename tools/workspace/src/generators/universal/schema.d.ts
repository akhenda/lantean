/**
 * The options passed to the generator.
 */
export interface UniversalGeneratorSchema {
  uiName: string;
  libName: string;
  skipFormat: boolean;
}

/**
 * The possible lib folders.
 */
export type LibFolder = 'core' | 'design' | 'features';

/**
 * The path of the lib folder.
 */
export type LibPath = {
  path: string;
  root: string;
};

/**
 * The paths of the lib folders.
 */
export type LibPaths = {
  [k in LibFolder]: LibPath;
};

/**
 * The names of the lib folders.
 */
export type LibFolderNames = {
  [k in LibFolder]: string;
} & {
  designUI: string;
  designLib: string;
};

/**
 * The tags of the libs.
 */
export type LibTags = {
  ui: readonly string[];
  lib: readonly string[];
};

/**
 * The normalized options passed to the generator.
 */
export interface NormalizedSchema extends UniversalGeneratorSchema {
  name: string;
  npmScope: string;
  npmScopeTitle: string;
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  importPath: string;
  libsDir: string;
  appsDir: string;

  folderNames: LibFolderNames;
  paths: LibPaths;
  tags: LibTags;
}
