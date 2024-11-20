import { join } from 'path';

import {
  addDependenciesToPackageJson,
  generateFiles,
  readProjectConfiguration,
  Tree,
  updateJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TSConfig } from '@schemastore/tsconfig';
import { JSONSchemaForESLintConfigurationFiles as ESLintConfig } from '@schemastore/package';

import { deps, devDeps } from './constants';
import { NormalizedSchema } from './schema';

import { updateTSConfigCompilerOptions } from '../../utils';

function cleanupLib(tree: Tree, libDirectory: string) {
  tree.delete(`${libDirectory}/src/index.ts`);

  const libFiles = tree.children(`${libDirectory}/src/lib`);

  for (const file of libFiles) {
    tree.delete(`${libDirectory}/src/lib/${file}`);
  }
}

export function addDependencies(tree: Tree) {
  const dependencies: Record<string, string> = deps;
  const devDependencies: Record<string, string> = devDeps;

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

export function addLibFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = { ...options, template: '' };

  generateFiles(tree, join(__dirname, 'files'), options.projectRoot, templateOptions);
}

function updateTSConfigs(tree: Tree, options: NormalizedSchema) {
  updateJson<TSConfig>(tree, join(options.projectRoot, 'tsconfig.json'), (json) => {
    return updateTSConfigCompilerOptions(json, {
      noPropertyAccessFromIndexSignature: false,
      esModuleInterop: true,
      jsx: 'react',
      resolveJsonModule: true,
    });
  });
}

function updateESLintConfig(tree: Tree, options: NormalizedSchema) {
  updateJson<ESLintConfig>(tree, join(options.projectRoot, '.eslintrc.json'), (json) => {
    if (json.overrides && json.overrides.length) {
      json.overrides.forEach((override) => {
        if (override.files && override.files.includes('*.json')) {
          override.rules['@nx/dependency-checks'] = [
            'error',
            {
              ignoredDependencies: [
                ...Object.keys(deps),
                ...Object.keys(devDeps),
                options.loggingLibImportPath,
                options.typesLibImportPath,
              ],
            },
          ];
        }
      });
    }

    return json;
  });
}

function updateProjectJson(tree: Tree, options: NormalizedSchema) {
  // Reference:
  // https://medium.com/@tomas.gabrs/setting-up-drizzle-orm-with-fastify-in-an-nx-monorepo-fdd34229254c
  const { projectName, libsDir } = options;
  const projectConfig = readProjectConfiguration(tree, projectName);

  updateProjectConfiguration(tree, projectName, {
    ...projectConfig,
    targets: {
      ...projectConfig.targets,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'db:generate': {
        executor: 'nx:run-commands',
        options: {
          command: 'drizzle-kit generate --config=./drizzle.config.ts',
          cwd: `${libsDir}/${projectName}`,
        },
      },
      'db:migrate': {
        executor: 'nx:run-commands',
        defaultConfiguration: 'local',
        options: {
          command: 'drizzle-kit migrate --config=./drizzle.config.ts',
          cwd: `${libsDir}/${projectName}`,
        },
        configurations: {
          local: {},
        },
      },
    },
  });
}

export async function generateDBLib(tree: Tree, options: NormalizedSchema) {
  await libraryGenerator(tree, {
    compiler: 'tsc',
    directory: options.projectRoot,
    linter: 'eslint',
    name: options.projectName,
    projectNameAndRootFormat: 'as-provided',
    setParserOptionsProject: true,
    strict: true,
    tags: options.parsedTags.join(','),
  });

  cleanupLib(tree, options.projectRoot);
  addLibFiles(tree, options);
  updateTSConfigs(tree, options);
  updateESLintConfig(tree, options);
  updateProjectJson(tree, options);
  addDependencies(tree);
}
