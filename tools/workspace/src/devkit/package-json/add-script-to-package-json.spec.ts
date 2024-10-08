import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { addScriptToPackageJson } from './add-script-to-package-json';
import { readPackageJson, writePackageJson } from './package-json';

describe('@lantean/workspace devkit addScriptToPackageJson', () => {
  let tree: Tree;
  const scriptName = 'test';
  const script = 'nx test';

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  it('should add a script to package.json', () => {
    addScriptToPackageJson(tree, scriptName, script);

    expect(readPackageJson(tree).scripts?.[scriptName]).toBe(script);
  });

  it('should not overwrite script in package.json', () => {
    const packageJson = readPackageJson(tree);

    packageJson.scripts = { [scriptName]: script };
    writePackageJson(tree, packageJson);
    addScriptToPackageJson(tree, scriptName, 'nx test --watch');

    expect(console.log).toHaveBeenCalledWith(
      `Skipping adding script to package.json: ${scriptName}`
    );
    expect(readPackageJson(tree).scripts?.[scriptName]).toBe(script);
  });
});
