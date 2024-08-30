export interface LintingGeneratorSchema {
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
   * Applies deprecation.
   */
  deprecation?: boolean;

  /**
   * Applies import.
   */
  importOrder?: boolean;

  /**
   * Applies prettier.
   */
  prettier?: boolean;
}