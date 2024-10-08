import type { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';
import { LintingGeneratorSchema } from './schema';

/**
 * Extracts the element type of an array.
 */
type ArrayElement<ArrayType> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

/**
 * ESLint configuration override rules.
 */
export type EsLintConfigurationOverrideRules = Exclude<JSONSchemaForESLintConfigurationFiles['overrides'], undefined>;

/**
 * ESLint configuration override rule.
 */
export type EsLintConfigurationOverrideRule = ArrayElement<EsLintConfigurationOverrideRules>;

/**
 * The normalized options passed to the generator.
 */
export interface NormalizedSchema extends LintingGeneratorSchema {
  name: string;
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  importPath: string;
  libsDir: string;
  appsDir: string;
  parsedTags: string[];
}
