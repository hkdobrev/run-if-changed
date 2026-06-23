import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  copyFileSync,
  existsSync,
  chmodSync,
  mkdirSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// End-to-end tests: build a throwaway git repository, wire the real
// `run-if-changed` CLI in as an actual git hook, drive real git operations and
// assert on the side effects of the commands it runs. Nothing is mocked — this
// exercises the same path a consumer hits when husky calls the binary.

const CLI = fileURLToPath(new URL('../run-if-changed.js', import.meta.url));
const MARK = fileURLToPath(new URL('./fixtures/mark.mjs', import.meta.url));

let dir;

const git = (...args) => {
  const result = spawnSync('git', args, {
    cwd: dir,
    encoding: 'utf8',
    env: {
      ...process.env,
      // Keep the test hermetic: ignore the developer's global/system git
      // config (e.g. a global gitignore, custom hooksPath or default branch)
      // so results don't depend on the machine running the suite.
      GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_CONFIG_SYSTEM: '/dev/null',
      GIT_AUTHOR_NAME: 'test',
      GIT_AUTHOR_EMAIL: 'test@example.com',
      GIT_COMMITTER_NAME: 'test',
      GIT_COMMITTER_EMAIL: 'test@example.com',
    },
  });

  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed:\n${result.stderr}`);
  }

  return result;
};

const write = (relativePath, contents) => {
  const full = join(dir, relativePath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents);
};

// Drop a copy of the marker script into a package directory so a command run
// with that package as its cwd can resolve `node mark.mjs`.
const installMark = (relativeDir) => copyFileSync(MARK, join(dir, relativeDir, 'mark.mjs'));

const writeConfig = (config) =>
  write('package.json', JSON.stringify({ name: 'e2e-fixture', 'run-if-changed': config }, null, 2));

// Install a git hook that invokes the real CLI, exactly like husky would.
const installHook = (name) => {
  const hook = join(dir, '.git', 'hooks', name);
  writeFileSync(hook, `#!/bin/sh\nexec node "${CLI}"\n`);
  chmodSync(hook, 0o755);
};

// Run the CLI directly (rather than via git) so we can observe its exit code.
const runCli = () => spawnSync('node', [CLI], { cwd: dir, encoding: 'utf8' });

const markerLines = (relativeDir = '.') => {
  const marker = join(dir, relativeDir, 'marker.log');
  return existsSync(marker) ? readFileSync(marker, 'utf8').trim().split('\n').filter(Boolean) : [];
};

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'rif-e2e-'));
  git('init', '-q', '-b', 'main');
  git('config', 'core.hooksPath', '.git/hooks');
  copyFileSync(MARK, join(dir, 'mark.mjs'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('run-if-changed end-to-end', () => {
  it('does not crash on the very first commit (no previous HEAD)', () => {
    writeConfig({ 'watched.txt': 'node mark.mjs ran' });
    installHook('post-commit');
    write('watched.txt', 'a\n');

    // The post-commit hook fires here; with only one reflog entry there is no
    // previous HEAD, so the hook must exit cleanly and run nothing.
    assert.doesNotThrow(() => git('add', '.'));
    assert.doesNotThrow(() => git('commit', '-qm', 'first'));
    assert.deepEqual(markerLines(), []);
  });

  it('runs the configured command when a watched file changes', () => {
    writeConfig({ 'watched.txt': 'node mark.mjs ran' });
    installHook('post-commit');

    write('watched.txt', 'a\n');
    git('add', '.');
    git('commit', '-qm', 'first');

    // Second commit touches the watched file, so the hook should run the command.
    write('watched.txt', 'b\n');
    git('add', '.');
    git('commit', '-qm', 'second');

    assert.deepEqual(markerLines(), ['ran']);
  });

  it('does not run when only unwatched files change', () => {
    writeConfig({ 'watched.txt': 'node mark.mjs ran' });
    installHook('post-commit');

    write('watched.txt', 'a\n');
    git('add', '.');
    git('commit', '-qm', 'first');

    write('other.txt', 'x\n');
    git('add', '.');
    git('commit', '-qm', 'second');

    assert.deepEqual(markerLines(), []);
  });

  it('matches files in directories via globstar patterns (#123)', () => {
    writeConfig({ 'prisma/**': 'node mark.mjs migrate' });
    installHook('post-commit');

    write('watched.txt', 'a\n');
    git('add', '.');
    git('commit', '-qm', 'first');

    mkdirSync(join(dir, 'prisma'));
    write('prisma/schema.sql', 'create table t;\n');
    git('add', '.');
    git('commit', '-qm', 'add migration');

    assert.deepEqual(markerLines(), ['migrate']);
  });

  it('runs the command after a merge brings in a watched file', () => {
    writeConfig({ 'package-lock.json': 'node mark.mjs install' });
    installHook('post-merge');

    write('package-lock.json', '{}\n');
    git('add', '.');
    git('commit', '-qm', 'first');

    git('checkout', '-q', '-b', 'feature');
    write('package-lock.json', '{ "updated": true }\n');
    git('add', '.');
    git('commit', '-qm', 'update lock');

    git('checkout', '-q', 'main');
    git('merge', '-q', '--no-edit', 'feature');

    assert.deepEqual(markerLines(), ['install']);
  });

  it('exits non-zero (without an unhandled-rejection stack) when a command fails', () => {
    writeConfig({ 'watched.txt': 'node -e process.exit(3)' });

    write('watched.txt', 'a\n');
    git('add', '.');
    git('commit', '-qm', 'first');

    // Second commit makes watched.txt a changed file; run the CLI directly so
    // we can read its exit code.
    write('watched.txt', 'b\n');
    git('add', '.');
    git('commit', '-qm', 'second');

    const result = runCli();
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stderr, /UnhandledPromiseRejection|at runCommand/);
  });
});

describe('run-if-changed in a monorepo', () => {
  it('runs each package command in that package directory', () => {
    // A pnpm-workspace-style repo: one git repo, a config per package.
    write('pnpm-workspace.yaml', "packages:\n  - 'packages/*'\n");
    write('package.json', JSON.stringify({ name: 'root', private: true }));
    write(
      'packages/api/package.json',
      JSON.stringify({ name: 'api', 'run-if-changed': { 'src/**': 'node mark.mjs api-built' } }),
    );
    write(
      'packages/web/package.json',
      JSON.stringify({ name: 'web', 'run-if-changed': { 'src/**': 'node mark.mjs web-built' } }),
    );
    installMark('packages/api');
    installMark('packages/web');
    installHook('post-commit');

    write('packages/api/src/index.js', 'a\n');
    write('packages/web/src/index.js', 'w\n');
    git('add', '.');
    git('commit', '-qm', 'first');

    // Only the api package changes, so only its command runs — and the marker
    // lands inside packages/api, proving the command ran with that cwd.
    write('packages/api/src/index.js', 'a2\n');
    git('add', '.');
    git('commit', '-qm', 'touch api');

    assert.deepEqual(markerLines('packages/api'), ['api-built']);
    assert.deepEqual(markerLines('packages/web'), []);
  });

  it('inherits the root config for a package that defines none (#2)', () => {
    write(
      'package.json',
      JSON.stringify({ name: 'root', 'run-if-changed': { '**/*.txt': 'node mark.mjs root-ran' } }),
    );
    // This package has a package.json but no run-if-changed config, so its
    // files must fall through to the nearest ancestor config (the root).
    write('packages/docs/package.json', JSON.stringify({ name: 'docs' }));
    installHook('post-commit');

    write('packages/docs/README.md', 'x\n');
    git('add', '.');
    git('commit', '-qm', 'first');

    write('packages/docs/notes.txt', 'hello\n');
    git('add', '.');
    git('commit', '-qm', 'add notes');

    // Command runs from the repo root, so the marker lands at the root.
    assert.deepEqual(markerLines(), ['root-ran']);
    assert.deepEqual(markerLines('packages/docs'), []);
  });
});
