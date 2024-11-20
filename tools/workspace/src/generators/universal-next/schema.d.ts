import { names } from '@nx/devkit';

/**
 * The options passed to the generator.
 */
export interface UniversalNextGeneratorSchema {
  name: string;
  uiName: string;
  libName: string;
}

/**
 * The normalized options passed to the generator.
 */
export interface NormalizedSchema extends UniversalNextGeneratorSchema {
  name: string;
  npmScope: string;
  npmScopeTitle: string;
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  importPath: string;
  libsDir: string;
  appsDir: string;
  tags: readonly string[];

  names: ReturnType<typeof names>;

  uiName: string;
  libName: string;
  universalLibName: string;
  universalLibImportPath: string;
}
