# @lantean/workspace:env

Setups up an env configs repo that holds shared workspace envs in the monorepo.

> This library should only be used for common env variables and constants. Otherwise, each project should manage its own envs.

```shell
nx g @lantean/workspace:env
```

Uses [T3 Env](https://env.t3.gg/docs/introduction), [Next-ZodEnv](https://github.com/morinokami/next-zodenv) and [Envalid](https://www.npmjs.com/package/envalid)
