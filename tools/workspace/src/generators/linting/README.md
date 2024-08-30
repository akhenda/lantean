# @lantean/workspace:linting

Setup command, which will prompt one by one the set of rules that can be added:

```shell
nx g @lantean/workspace:linting
```

Adds a set of [ESLint](https://eslint.org/) rules to enhance code style in projects. Shipped as a generator instead of a [configuration package](https://eslint.org/docs/latest/user-guide/configuring/) so that it can be customized and edited by repo, and to automate the configuration of projects with TypeScript. Additionally, since it is an Nx plugin it can automatically apply upgrade changes if needed. The rules that it adds include:

- `eslint:recommended`
- `sonarjs/recommended`
- `unused-imports`
- `@typescript-eslint/recommended`
- `deprecation`
- `import/recommended`

Updates [`prettier`](https://github.com/prettier/prettier) configuration with some defaults, and adds [`prettier/recommended`](https://github.com/prettier/eslint-plugin-prettier) rule to ESLint configuration.
