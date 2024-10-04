/**
 * The options passed to the generator.
 */
export interface WebGeneratorSchema {
  uiName: string;
  utilsName: string;
}

/**
 * The possible lib folders.
 */
export type LibFolder =
  | 'design'
  | 'features'
  | 'hooks'
  | 'providers'
  | 'stores'
  | 'utils';

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
  designUtils: string;
};

/**
 * The tags of the libs.
 */
export type LibTags = {
  ui: string[];
  utils: string[];
};

/**
 * The normalized options passed to the generator.
 */
export interface NormalizedSchema extends WebGeneratorSchema {
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
