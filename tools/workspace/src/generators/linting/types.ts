import type { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';

type ArrayElement<ArrayType> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

/**
 * ESLint configuration override rules.
 */
export type EsLintConfigurationOverrideRules = Exclude<JSONSchemaForESLintConfigurationFiles['overrides'], undefined>;

/**
 * ESLint configuration override rule.
 */
export type EsLintConfigurationOverrideRule = ArrayElement<EsLintConfigurationOverrideRules>;
