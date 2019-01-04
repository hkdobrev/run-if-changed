# 🔃 run-if-changed [![Build Status](https://travis-ci.org/hkdobrev/run-if-changed.svg?branch=master)](https://travis-ci.org/hkdobrev/run-if-changed)

Run a command if a file changes via Git hooks.
Useful for lock files or build systems to keep dependencies and generated files up to date when changing branches, pulling or commiting.

Inspired by [`lint-staged`](https://github.com/okonet/lint-staged) and recommended to be used with [`husky`](https://github.com/typicode/husky).

#### State of the project

run-if-changes is functional as-is, but it's still quite basic and rough as it has just been published. So issues, feature requests and pull requests are most welcome!

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
yarn add -D husky @hkdobrev/run-if-changed
```

##### Recommended setup:

```json
"run-if-changed": {
    "yarn.lock": "yarn install"
}
```

#### Install with npm:

```shell
npm install --save-dev husky @hkdobrev/run-if-changed
```

##### Recommended setup:

```json
"run-if-changed": {
    "package-lock.json": "npm install"
}
```

## Why

The use case for `run-if-changed` is mostly for a team working on a project and push and pull code in different branches. When you share dependencies, database migrations or compilable code in the shared Git repository often some commands need to be run when a file or folder gets updated.

Check out the [common use cases](#use-cases).

## Configuration

* `run-if-changed` object in your `package.json`
* `.run-if-changedrc` file in JSON or YML format
* `run-if-changed.config.js` file in JS format

See [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) for more details on what formats are supported.

Configuration should be an object where each key is a file or directory mathed by Git  and the value is either a signle command or an array of commands to run if the file have changed since the last Git operation.

## What commands are supported?

For now, only globally available commands are allowed. PRs welcome so local scripts are used first.

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
        "yarn.lock": "yarn install"
    }
}
```

`.run-if-changedrc`:

```json
{
    "yarn.lock": "yarn install"
}
```
</details>

<details>
<summary><b>When using npm:</b></summary>

`package.json`:

```json
{
    "run-if-changed": {
        "package-lock.json": "npm install"
    }
}
```

`.run-if-changedrc`:

```json
{
    "package-lock.json": "npm install"
}
```

</details>

<details>
<summary><b>When using Composere:</b></summary>

`package.json`:

```json
{
    "run-if-changed": {
        "composer.lock": "composer install"
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

