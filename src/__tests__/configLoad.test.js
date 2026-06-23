import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import configLoad from '../configLoad.js';

// `configLoad` resolves real config files via cosmiconfig, so each test runs
// inside an isolated temp directory. A bare package.json makes it a project
// root, so cosmiconfig's 'project' search strategy stops there and never
// reaches the real repository above.

let dir;
let originalCwd;

beforeEach(() => {
  originalCwd = process.cwd();
  dir = mkdtempSync(join(tmpdir(), 'rif-config-'));
  writeFileSync(join(dir, 'package.json'), '{}\n');
  process.chdir(dir);
});

afterEach(() => {
  process.chdir(originalCwd);
  rmSync(dir, { recursive: true, force: true });
  mock.restoreAll();
});

describe('configLoad', () => {
  it('returns the config discovered by cosmiconfig', () => {
    const config = { 'package-lock.json': ['npm install'] };
    writeFileSync(join(dir, '.run-if-changedrc.json'), JSON.stringify(config));

    assert.deepEqual(configLoad(), config);
  });

  it('exits with code 0 when no config is found', () => {
    const exit = mock.method(process, 'exit', () => {
      throw new Error('process.exit called');
    });

    assert.throws(() => configLoad(), /process\.exit called/);
    assert.deepEqual(exit.mock.calls[0].arguments, [0]);
  });
});
