# @lantean/workspace:commitlint

Setup command:

```shell
nx g @lantean/workspace:commitlint
```

Uses [`commitlint`](https://github.com/conventional-changelog/commitlint) with [`cz-git`](https://cz-git.qbb.sh/) adapter and [`husky`](https://github.com/typicode/husky) to lint commit messages to adhere to [conventional commits](https://www.conventionalcommits.org/). It uses the default configuration provided by [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional). It also configures [@commitlint/config-nx-scopes](https://github.com/conventional-changelog/commitlint) to enforce nx project and workspace names as scopes.

Sets up Semantic release using [nx-semantic-release](https://github.com/TheUnderScorer/nx-semantic-release).
