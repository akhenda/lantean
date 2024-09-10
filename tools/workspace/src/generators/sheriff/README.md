# @lantean/workspace:sheriff

```shell
nx g @lantean/workspace:sheriff
```

Adds [Sheriff](https://www.eslint-config-sheriff.dev/docs/introduction), a comprehensive ESLint configuration. It uses ESLint Flat config. Shipped as a generator instead of a [configuration package](https://eslint.org/docs/latest/user-guide/configuring/) so that it can be customized and edited by repo, and to automate the configuration of projects with TypeScript. Additionally, since it is an Nx plugin it can automatically apply upgrade changes if needed. The rules that it adds include:

Updates [`prettier`](https://github.com/prettier/prettier) configuration with some defaults.
