import type { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';
import { LintingGeneratorSchema } from './schema';

type ArrayElement<ArrayType> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

/**
 * ESLint configuration override rules.
 */
export type EsLintConfigurationOverrideRules = Exclude<JSONSchemaForESLintConfigurationFiles['overrides'], undefined>;

/**
 * ESLint configuration override rule.
 */
export type EsLintConfigurationOverrideRule = ArrayElement<EsLintConfigurationOverrideRules>;

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
