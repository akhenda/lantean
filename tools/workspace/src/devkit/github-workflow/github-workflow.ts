import { Tree } from '@nx/devkit';
import { parseDocument, stringify, YAMLSeq } from 'yaml';

/** Filename of CI GitHub workflow file */
export const ciFile = './.github/workflows/ci.yml';

/**
 * Model of a GitHub action job step.
 */
export interface GitHubActionJobStep {
  /** Name */
  name: string;

  /** Uses */
  uses?: string;

  /** If condition */
  if?: string;

  /** With */
  with?: { [key: string]: string | number | boolean };

  /** Run */
  run?: string;
}

/**
 * Checks if the CI workflow file exists in the tree.
 */
export function existsGitHubCiWorkflow(tree: Tree, override?: string): boolean {
  return tree.exists(override ?? ciFile);
}

/**
 * Add a job step in the CI workflow file.
 */
export function addGitHubCiJobStep(
  tree: Tree,
  job: string,
  step: GitHubActionJobStep,
  workflowFile: string = ciFile
) {
  const ci = parseDocument(tree.read(workflowFile)?.toString() ?? '');
  const jobSteps = ci.getIn(['jobs', job, 'steps']) as YAMLSeq<
    Map<keyof GitHubActionJobStep, string>
  >;

  if (jobSteps == null) {
    console.error(`Could not find "${job}" job in file: ${workflowFile}`);

    return;
  }

  if (jobSteps.items.some((item) => item.get('name') === step.name)) {
    console.error(
      `Step "${step.name}" in "${job}" already present in file: ${workflowFile}`,
    );

    return;
  }

  jobSteps.add(step as unknown as Map<keyof GitHubActionJobStep, string>);

  tree.write(workflowFile, stringify(ci));
}
