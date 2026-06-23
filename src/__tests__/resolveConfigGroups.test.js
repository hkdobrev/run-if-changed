import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import resolveConfigGroups from '../resolveConfigGroups.js';

// resolveConfigGroups is pure: it takes the changed files, the repo root and a
// `loadConfig(dir)` lookup. The tests inject a fake lookup keyed by absolute
// directory, so no real filesystem is touched.

const ROOT = '/repo';

const loaderFor = (configsByDir) => (dir) => configsByDir[dir] ?? null;

describe('resolveConfigGroups', () => {
  it('groups files under their nearest config, with package-relative paths', () => {
    const load = loaderFor({
      '/repo': { 'package-lock.json': 'root' },
      '/repo/packages/api': { 'src/**': 'build-api' },
    });

    const groups = resolveConfigGroups(
      ['package-lock.json', 'packages/api/src/index.js', 'packages/api/schema.sql'],
      ROOT,
      load,
    );

    assert.deepEqual(groups, [
      { cwd: '/repo', config: { 'package-lock.json': 'root' }, files: ['package-lock.json'] },
      {
        cwd: '/repo/packages/api',
        config: { 'src/**': 'build-api' },
        files: ['src/index.js', 'schema.sql'],
      },
    ]);
  });

  it('inherits an ancestor config when a directory defines none', () => {
    // packages/web has a package.json but no run-if-changed config, so its
    // files are owned by the root config (the nearest one found walking up).
    const load = loaderFor({ '/repo': { '**/*.ts': 'root' } });

    const groups = resolveConfigGroups(['packages/web/src/app.ts'], ROOT, load);

    assert.deepEqual(groups, [
      { cwd: '/repo', config: { '**/*.ts': 'root' }, files: ['packages/web/src/app.ts'] },
    ]);
  });

  it('lets the nearest config win over an ancestor', () => {
    const load = loaderFor({
      '/repo': { '**': 'root' },
      '/repo/packages/api': { '**': 'api' },
    });

    const groups = resolveConfigGroups(['packages/api/src/index.js', 'README.md'], ROOT, load);

    assert.deepEqual(groups, [
      { cwd: '/repo/packages/api', config: { '**': 'api' }, files: ['src/index.js'] },
      { cwd: '/repo', config: { '**': 'root' }, files: ['README.md'] },
    ]);
  });

  it('ignores files that have no config anywhere up to the repo root', () => {
    const groups = resolveConfigGroups(['some/file.js'], ROOT, () => null);

    assert.deepEqual(groups, []);
  });
});
