import { configFile, execESLint, fixtureFile } from '../../utils';

describe('config', () => {
  describe('prettier', () => {
    it('validates source files using prettier', () => {
      const test = execESLint(`--config ${configFile('prettier')} ${fixtureFile('prettier')}`);

      expect(test).toMatch(/Replace .*"bar".* with .*'bar'/);
    }, 8000);

    it('validates TypeScript source files using prettier', () => {
      const test = execESLint(
        `--config ${fixtureFile('prettier-typescript/.eslintrc.js')} ${fixtureFile('prettier-typescript')}`,
      );

      expect(test).toMatch(/Replace .*"bar".* with .*'bar'/);
    }, 8000);

    it('uses .prettierrc as the source of prettier rules', () => {
      expect(execESLint(`--config ${configFile('prettier')} ${fixtureFile('prettier-config')}`)).toMatch(/Delete .;./);
    }, 8000);

    it('uses .prettierrc as the source of prettier rules for TypeScript', () => {
      expect(
        execESLint(`--config ${fixtureFile('prettier-typescript/.eslintrc.js')} ${fixtureFile('prettier-config')}`),
      ).toMatch(/Delete .;./);
    }, 8000);
  });
});
