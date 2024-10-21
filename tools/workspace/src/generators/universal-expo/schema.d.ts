import { names } from '@nx/devkit';

/**
 * The options passed to the generator.
 */
export interface UniversalExpoGeneratorSchema {
  name: string;
  displayName: string;
  uiName: string;
  libName: string;
}

/**
 * The normalized options passed to the generator.
 */
export interface NormalizedSchema extends UniversalExpoGeneratorSchema {
  name: string;
  displayName: string;
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
