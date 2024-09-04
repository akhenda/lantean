import { generateFiles, Tree } from '@nx/devkit';
import { addBadgeToReadme, ciFile, getGitRepo, joinNormalize } from '../../devkit';
import { NormalizedSchema } from './schema';

export function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = { ...options, tmpl: '' };

  if (tree.exists(ciFile)) {
    const defaultNXCIFile = tree.read(ciFile, 'utf-8').toString();

    tree.write(ciFile.replace('yml', 'yml.original'), defaultNXCIFile);
    tree.delete(ciFile);
  }

  generateFiles(
    tree,
    joinNormalize(__dirname, 'files'),
    '.github',
    templateOptions
  );
}

export function useNXCloud(tree: Tree, options: NormalizedSchema) {
  if (options.useNxCloud) {
    console.log(
      `In order to use Nx Cloud add a secret with the NX_CLOUD_AUTH_TOKEN`
    );
    console.log(
      `It is suggested that you create a new token for this purpose with read/write access.`
    );
    console.log(`You can configure it at: https://cloud.nx.app/`);
    console.log(
      `Also consider using Nx Cloud GitHub app to access run results: https://github.com/apps/nx-cloud`
    );
    console.log();
  }
}

export function updateReadMe(tree: Tree) {
  const gitRepo = getGitRepo(tree);

  if (gitRepo == null) {
    console.error(
      `Could not add badge to README, remote repo could not be detected.`
    );
  } else {
    addBadgeToReadme(
      tree,
      `${gitRepo}/actions/workflows/merge.yml/badge.svg`,
      `${gitRepo}/actions/workflows/merge.yml`,
      'CI',
      true
    );
  }
}
