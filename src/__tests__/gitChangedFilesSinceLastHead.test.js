import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

import gitChangedFilesSinceLastHead from '../gitChangedFilesSinceLastHead.js';

// The module shells out to `git diff-tree ... HEAD@{1} HEAD`, so we build a
// throwaway repository with two commits and run against it for real.

const git = (cwd, ...args) =>
  execFileSync('git', args, {
    cwd,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'test',
      GIT_AUTHOR_EMAIL: 'test@example.com',
      GIT_COMMITTER_NAME: 'test',
      GIT_COMMITTER_EMAIL: 'test@example.com',
    },
  });

describe('gitChangedFilesSinceLastHead', () => {
  let dir;
  let originalCwd;

  before(() => {
    originalCwd = process.cwd();
    dir = mkdtempSync(join(tmpdir(), 'rif-git-'));
    git(dir, 'init', '-q');

    writeFileSync(join(dir, 'first.txt'), 'a\n');
    git(dir, 'add', '.');
    git(dir, 'commit', '-qm', 'first');

    // The second commit changes only second.txt; after it, HEAD@{1} points at
    // the first commit, so the diff against HEAD should be exactly second.txt.
    writeFileSync(join(dir, 'second.txt'), 'b\n');
    git(dir, 'add', '.');
    git(dir, 'commit', '-qm', 'second');

    process.chdir(dir);
  });

  after(() => {
    process.chdir(originalCwd);
    rmSync(dir, { recursive: true, force: true });
  });

  it('lists files changed since the previous HEAD', () => {
    assert.deepEqual(gitChangedFilesSinceLastHead(), ['second.txt']);
  });

  it('does not include empty strings', () => {
    assert.ok(gitChangedFilesSinceLastHead().every((file) => file !== ''));
  });
});
