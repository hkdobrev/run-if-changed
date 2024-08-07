# 🔃 run-if-changed [![npm version](https://img.shields.io/npm/v/@hkdobrev/run-if-changed.svg)](https://www.npmjs.com/package/@hkdobrev/run-if-changed)

Run a command if a file changes via Git hooks.
Useful for lock files or build systems to keep dependencies and generated files up to date when changing branches, pulling or commiting.

Inspired by [`lint-staged`](https://github.com/okonet/lint-staged) and recommended to be used with [`husky`](https://github.com/typicode/husky).

#### State of the project

run-if-changed is functional as-is, but it's still quite basic and rough as it has just been published. So issues, feature requests and pull requests are most welcome!

## Installation and setup

<details open>
<summary><b>Install with npm</b></summary>

<pre><code class="language-shell">
npm install --save-dev husky @hkdobrev/run-if-changed
</code></pre>

<h5>Recommended setup</h5>

<pre><code class="language-json">
"run-if-changed": {
  "package-lock.json": "npm install --prefer-offline --no-audit"
}
</code></pre>
</details>

<details>
<summary><b>Install with Yarn</b></summary>

<pre><code class="language-shell">
yarn add --dev husky @hkdobrev/run-if-changed
</code></pre>

<h5>Recommended setup</h5>

<pre><code class="language-json">
"run-if-changed": {
  "yarn.lock": "yarn install --prefer-offline --pure-lockfile --color=always"
}
</code></pre>
</details>

### Set up Git hooks

<details open>
<summary><b>Using <a href="https://typicode.github.io/husky/"><code>husky</code></a></b></summary>

<pre><code class="language-shell">
echo "npm run run-if-changed" > .husky/post-commit
echo "npm run run-if-changed" > .husky/post-checkout
echo "npm run run-if-changed" > .husky/post-merge
echo "npm run run-if-changed" > .husky/post-rewrite
</code></pre>

</details>

<details>
<summary><b>Just git hooks</b></summary>

<pre><code class="language-shell">
echo "npm run run-if-changed" >> .git/hooks/post-commit && chmod +x .git/hooks/post-commit
echo "npm run run-if-changed" >> .git/hooks/post-checkout && chmod +x .git/hooks/post-checkout
echo "npm run run-if-changed" >> .git/hooks/post-merge && chmod +x .git/hooks/post-merge
echo "npm run run-if-changed" >> .git/hooks/post-rewrite && chmod +x .git/hooks/post-rewrite
</code></pre>

</details>

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

`run-if-changed` is using [`execa`](https://github.com/sindresorhus/execa) to locate locally installed scripts and run them. So in your `.run-if-changedrc` you can just write and it would use the local version:

<pre><code class="language-json">
{
  "src": "webpack"
}
</code></pre>

Sequences of commands are supported. Pass an array of commands instead of a single one and they will run sequentially.

## Use cases

#### Install or update dependencies when lock file changes

If you use a dependency manager with a lock file like npm, Yarn, Composer, Bundler or others, you would usually add a dependency and the dependency manager would install it and add it to the lock file in a single run. However, when someone else has updated a dependency and you pull new code or checkout their branch you need to manually run the install command of your dependency manager.

Here's example configuration of `run-if-changed`:

<details open>
<summary><b>npm</b></summary>

<code>package.json</code>

<pre><code class="language-json">
{
  "run-if-changed": {
    "package-lock.json": "npm install --prefer-offline --no-audit"
  }
}
</code></pre>

`.run-if-changedrc`

<pre><code class="language-json">
{
  "package-lock.json": "npm install --prefer-offline --no-audit"
}
</code></pre>

</details>

<details>
<summary><b>Yarn</b></summary>

<code>package.json</code>

<pre><code class="language-json">
{
  "run-if-changed": {
    "yarn.lock": "yarn install --prefer-offline --pure-lockfile --color=always"
  }
}
</code></pre>

<code>.run-if-changedrc</code>

<pre><code class="language-json">
{
  "yarn.lock": "yarn install --prefer-offline --pure-lockfile --color=always"
}
</code></pre>

</details>

<details>
<summary><b>Composer</b></summary>

<code>package.json</code>

<pre><code class="language-json">
{
  "run-if-changed": {
    "composer.lock": "composer install --ignore-platform-reqs --ansi"
  }
}
</code></pre>

</details>

<details>
<summary><b>Bundler</b></summary>

<code>package.json</code>

<pre><code class="language-json">
{
  "run-if-changed": {
    "Gemfile.lock": "bundle install"
  }
}
</code></pre>

</details>

#### Run database migrations if there are new migrations

If you keep database migrations in your repository, you'd usually want to run them when you check out a branch or pull from master.

<details>
<summary>Example of running Doctrine migrations when pulling or changing branches</summary>

<code>package.json</code>

<pre><code class="language-json">
{
  "run-if-changed": {
    "migrations": "./console db:migrate --allow-no-migration --no-interaction"
  }
}
</code></pre>

</details>

#### Compile sources in a build folder after pulling new code.

<details>
<summary>Example for running build on changing src folder when pulling or changing branches</summary>

<code>package.json</code>

<pre><code class="language-json">
{
  "run-if-changed": {
    "src": "npm run build"
  }
}
</code></pre>

</details>
