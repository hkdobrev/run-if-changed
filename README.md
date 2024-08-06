# 🔃 run-if-changed [![npm version](https://img.shields.io/npm/v/@hkdobrev/run-if-changed.svg)](https://www.npmjs.com/package/@hkdobrev/run-if-changed)

Run a command if a file changes via Git hooks.
Useful for lock files or build systems to keep dependencies and generated files up to date when changing branches, pulling or commiting.

Inspired by [`lint-staged`](https://github.com/okonet/lint-staged) and recommended to be used with [`husky`](https://github.com/typicode/husky).

#### State of the project

run-if-changed is functional as-is, but it's still quite basic and rough as it has just been published. So issues, feature requests and pull requests are most welcome!

## Installation and setup

In `package.json`:

```json
"husky": {
  "hooks": {
    "post-commit": "run-if-changed",
    "post-checkout": "run-if-changed",
    "post-merge": "run-if-changed",
    "post-rewrite": "run-if-changed"
  }
}
```

#### Install with Yarn:

```shell
yarn add --save-dev husky @hkdobrev/run-if-changed
```

##### Recommended setup:

```json
"run-if-changed": {
  "yarn.lock": "yarn install --prefer-offline --pure-lockfile --color=always"
}
```

#### Install with npm:

```shell
npm install --save-dev husky @hkdobrev/run-if-changed
```

##### Recommended setup:

```json
"run-if-changed": {
  "package-lock.json": "npm install --prefer-offline --no-audit"
}
```

## Why

The use case for `run-if-changed` is mostly for a team working on a project and push and pull code in different branches. When you share dependencies, database migrations or compilable code in the shared Git repository often some commands need to be run when a file or folder gets updated.

Check out the [common use cases](#use-cases).

## Configuration

- `run-if-changed` object in your `package.json`
- `.run-if-changedrc` file in JSON or YML format
- `run-if-changed.config.js` file in JS format

See [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) for more details on what formats are supported.

Configuration should be an object where each key is a file or directory match pattern and the value is either a single command or an array of commands to run if the file have changed since the last Git operation.

## What commands are supported?

Supported are any executables installed locally or globally via `npm` or Yarn as well as any executable from your `$PATH`.

> Using globally installed scripts is discouraged, since run-if-changed may not work for someone who doesn't have it installed.

`run-if-changed` is using [npm-which](https://github.com/timoxley/npm-which) to locate locally installed scripts. So in your `.run-if-changedrc` you can write:

```json
{
  "src": "webpack"
}
```

Sequences of commands are supported. Pass an array of commands instead of a single one and they will run sequentially.

## Use cases

#### Install or update dependencies when lock file changes

If you use a dependency manager with a lock file like npm, Yarn, Composer, Bundler or others, you would usually add a dependency and the dependency manager would install it and add it to the lock file in a single run. However, when someone else has updated a dependency and you pull new code or checkout their branch you need to manually run the install command of your dependency manager.

Here's example configuration of `run-if-changed`:

<details open>
<summary><b>When using Yarn:</b></summary>

`package.json`:

```json
{
  "run-if-changed": {
    "yarn.lock": "yarn install --prefer-offline --pure-lockfile --color=always"
  }
}
```

`.run-if-changedrc`:

```json
{
  "yarn.lock": "yarn install --prefer-offline --pure-lockfile --color=always"
}
```

</details>

<details>
<summary><b>When using npm:</b></summary>

`package.json`:

```json
{
  "run-if-changed": {
    "package-lock.json": "npm install --prefer-offline --no-audit"
  }
}
```

`.run-if-changedrc`:

```json
{
  "package-lock.json": "npm install --prefer-offline --no-audit"
}
```

</details>

<details>
<summary><b>When using Composer:</b></summary>

`package.json`:

```json
{
  "run-if-changed": {
    "composer.lock": "composer install --ignore-platform-reqs --ansi"
  }
}
```

</details>

<details>
<summary><b>When using Bundler:</b></summary>

`package.json`:

```json
{
  "run-if-changed": {
    "Gemfile.lock": "bundle install"
  }
}
```

</details>

#### Run database migrations if there are new migrations

If you keep database migrations in your repository, you'd usually want to run them when you check out a branch or pull from master.

`package.json`:

```json
{
  "run-if-changed": {
    "migrations": "./console db:migrate --allow-no-migration --no-interaction"
  }
}
```

The above example assumes PHP Doctrine migrations.

#### Compile sources in a build folder after pulling new code.

`package.json`:

```json
{
  "run-if-changed": {
    "src": "yarn build"
  }
}
```
