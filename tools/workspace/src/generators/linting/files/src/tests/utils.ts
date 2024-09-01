import { execSync } from 'child_process';
import { resolve } from 'path';

export function configFile(name: string) {
  return resolve(__dirname, '..', 'lib', 'config', `${name}.js`);
}

const eslintIgnorePath = resolve(__dirname, '..', 'tests', 'fixtures', `.eslintignore`);

export function execESLint(args: string) {
  try {
    // --ignore-path is required so we can override the.eslintignore file
    // --no-eslintrc is required so that we can break out of our project level
    // configuration
    return execSync(`node_modules/.bin/eslint --no-eslintrc --ignore-path ${eslintIgnorePath} ${args}`).toString();
  } catch (error) {
    if ((error as { stdout: string[] }).stdout) return (error as { stdout: string[] }).stdout.toString();

    throw error;
  }
}

export function fixtureFile(fixture: string) {
  return resolve(__dirname, 'fixtures', fixture);
}
