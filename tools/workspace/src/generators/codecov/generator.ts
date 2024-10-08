import { formatFiles, Tree } from '@nx/devkit';
import fetch from 'node-fetch-commonjs';

import {
  addNxNamedInput,
  getGitRepoSlug,
  addBadgeToReadme,
  existsGitHubCiWorkflow,
  addGitHubCiJobStep,
} from '../../devkit';

import {
  writeProjectsToCodecov,
  getCodecovFile,
  readRawCodecov,
} from './codecov';

/**
 * Path to the GitHub CI Validate File
 */
export const ciValidateFile = './.github/workflows/ci-validate.yml';

/**
 * Nx generator to setup codecov.
 */
export default async function codecovGenerator(tree: Tree) {
  writeProjectsToCodecov(tree);
  addNxNamedInput(
    tree,
    { codecov: ['{workspaceRoot}/' + getCodecovFile(tree)] },
    true
  );

  if (existsGitHubCiWorkflow(tree, ciValidateFile)) {
    addGitHubCiJobStep(tree, 'run-nx-cloud', {
      name: 'Codecov',
      uses: 'codecov/codecov-action@v3.1.0',
      if: `hashFiles('coverage/**/*') != ''`,
      with: { fail_ci_if_error: true, verbose: true },
    }, ciValidateFile);
  } else {
    console.error(
      `Codecov needs to be called from a CI pipeline, but it could not be found.`
    );
    console.error(
      `Try to generate it first using nx g @lantean/workspace:github`
    );
  }

  // Validate
  const response = await fetch(`https://api.codecov.io/validate`, {
    method: 'POST',
    body: readRawCodecov(tree),
  });
  if (response.ok) {
    console.log(`Codecov file was validated successfully`);
  } else {
    throw new Error(`Couldn't generate a valid Codecov file`);
  }

  console.log(
    `You can configure the Codecov app at: https://github.com/apps/codecov`
  );

  const gitRepoSlug = getGitRepoSlug(tree);
  if (gitRepoSlug == null) {
    console.error(
      `Could not add badge to README, remote repo could not be detected.`
    );
  } else {
    addBadgeToReadme(
      tree,
      `https://codecov.io/gh/${gitRepoSlug}/branch/main/graph/badge.svg`,
      `https://codecov.io/gh/${gitRepoSlug}`,
      'codecov'
    );
  }

  await formatFiles(tree);
}
