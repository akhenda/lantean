import {
  detectPackageManager,
  getPackageManagerCommand,
  PromiseExecutor,
} from '@nx/devkit';
import * as shell from 'shelljs';
import type { ExecOptions } from 'shelljs';

import { AddExecutorSchema } from './schema';

type Part = string | boolean;

export interface Options extends ExecOptions {
  asString?: boolean;
  asJSON?: boolean;
  silent?: boolean;
}

export const buildCommand = (parts: Part[]): string => {
  return parts.filter(Boolean).join(' ');
};

export function getPackageManagerDlxCommand() {
  return getPackageManagerCommand(detectPackageManager()).dlx;
}

export const execCommand = (
  command: string,
  options: Options = { asString: false, asJSON: false },
  isDryRun = false
) => {
  if (!options.silent || isDryRun) {
    console.log('\nRunning:');
    console.log(command);

    if (isDryRun) return { success: true, output: '' };
  }

  const result = shell.exec(command, options);

  if (options.asJSON) return JSON.parse(result.toString());
  if (options.asString) return result.toString();

  return { success: result['code'] === 0, output: result.stdout };
};

export function execPackageManagerCommand(command: string, options?: Options) {
  return execCommand(
    buildCommand([
      process.env.NX_EXTEND_COMMAND_USE_NPX
        ? 'npx'
        : getPackageManagerDlxCommand(),
      command,
    ]),
    options
  );
}

const runExecutor: PromiseExecutor<AddExecutorSchema> = async (options, context) => {
  if (!context.workspace) return  { success: false };

  const { root } = context.workspace.projects[context.projectName]

  execPackageManagerCommand(
    buildCommand([
      'shadcn-ui@latest add',
      (options.component ?? '').length === 0 ? '--all' : options.component,
      options.overwrite && '--overwrite',
      '--path=src',
      `--cwd=${root}`
    ]),
    {}
  )

  return { success: true }
};

export default runExecutor;
