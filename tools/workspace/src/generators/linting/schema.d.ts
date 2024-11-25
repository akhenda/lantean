export interface LintingGeneratorSchema {
  /**
   * Generate config lib.
   */
  lib?: boolean;

  /**
   * Applies eslint:recommended.
   */
  eslintRecommended?: boolean;

  /**
   * Applies sonarjs:recommended.
   */
  sonarJs?: boolean;

  /**
   * Applies unused-imports.
   */
  unusedImports?: boolean;

  /**
   * Applies @typescript-eslint/recommended.
   */
  typescriptRecommended?: boolean;

  /**
   * Applies import.
   */
  importOrder?: boolean;

  /**
   * Applies prettier.
   */
  prettier?: boolean;
}
