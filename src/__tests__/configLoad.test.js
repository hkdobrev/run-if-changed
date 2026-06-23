import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import configLoad from '../configLoad.js';

// `configLoad` resolves real config files via cosmiconfig, so each test runs
// inside an isolated temp directory. The 'none' search strategy means it only
// ever inspects the directory it is handed and never walks up into the real
// repository above.

let dir;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'rif-config-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('configLoad', () => {
  it('returns the config defined in the given directory', () => {
    const config = { 'package-lock.json': ['npm install'] };
    writeFileSync(join(dir, '.run-if-changedrc.json'), JSON.stringify(config));

    assert.deepEqual(configLoad(dir), config);
  });

  it('reads the config from a package.json run-if-changed key', () => {
    const config = { 'pnpm-lock.yaml': 'pnpm install' };
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ 'run-if-changed': config }));

    assert.deepEqual(configLoad(dir), config);
  });

  it('returns null when the directory has no config', () => {
    writeFileSync(join(dir, 'package.json'), '{}\n');

    assert.equal(configLoad(dir), null);
  });
});
