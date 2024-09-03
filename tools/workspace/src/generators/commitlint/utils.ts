import { getWorkspaceLayout, Tree } from '@nx/devkit';
import { NormalizedSchema } from './types';
import { CommitlintGeneratorSchema } from './schema';
import { defaultCommitlintConfigFile } from './constants';

export function normalizeOptions(
  tree: Tree,
  options: CommitlintGeneratorSchema,
): NormalizedSchema {
  const layout = getWorkspaceLayout(tree);
  const appsDir = layout.appsDir === '.' ? 'apps' : layout.appsDir;
  const libsDir = layout.libsDir === '.' ? 'libs' : layout.libsDir;

  return {
    ...options,
    appsDir,
    libsDir,
    fileName: options.configFileName ?? defaultCommitlintConfigFile,
  };
}

export const readmeContent = `Available for VSCode, IntelliJ and comes with a LSP for Vim users.

  ## Commitlint CZ-Git Config

  ### Setup OpenAI token

  1. <https://platform.openai.com/account/api-keys>
  Login and create your API secret key, which usually starts with sk-
  2. Run command \`npx czg --api-key=<API secret key>\` and input your key to setup your token save to local

  \`\`\`sh
  npx czg --api-key=sk-xxxxx
  \`\`\`

`;
