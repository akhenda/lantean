import { formatFiles, Tree } from '@nx/devkit';

import { getGitRepoSlug, readmeFile } from '../../devkit';

/**
 * Adds contributors attribution to `README.md` using `contrib.rocks`.
 *
 * @param tree The virtual file system tree.
 *
 * @throws {Error} If the remote repository could not be detected.
 * @throws {Error} If the `README.md` file does not exist.
 */
export async function contributorsGenerator(tree: Tree) {
  if (!tree.exists(readmeFile)) {
    throw new Error(`Missing Readme file at: ${readmeFile}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let readme = tree.read(readmeFile)!.toString();

  const repoSlug = getGitRepoSlug(tree);

  if (repoSlug == null) throw new Error(`Remote repo could not be detected.`);
  if (readme.includes(`## Contributors`)) {
    console.log(`Contributors section already existing at: ${readmeFile}`);

    return;
  }

  const link = `https://contrib.rocks/image?repo=${repoSlug}`;
  const image = `https://github.com/${repoSlug}/graphs/contributors`;

  readme += `## Contributors\n\n[![contributors](${link})](${image})\n`;

  tree.write(readmeFile, readme);

  await formatFiles(tree);
}

export default contributorsGenerator;
