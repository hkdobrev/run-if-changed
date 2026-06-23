import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import resolveMatchingPatterns from '../resolveMatchingPatterns.js';

describe('resolveMatchingPatterns', () => {
  it('returns the commands for a matching pattern', () => {
    const result = resolveMatchingPatterns(['package-lock.json'], {
      'package-lock.json': ['npm install'],
    });

    assert.deepEqual(result, ['npm install']);
  });

  it('returns an empty array when no pattern matches', () => {
    const result = resolveMatchingPatterns(['README.md'], {
      'package-lock.json': ['npm install'],
    });

    assert.deepEqual(result, []);
  });

  it('returns an empty array when no files changed', () => {
    const result = resolveMatchingPatterns([], {
      'package-lock.json': ['npm install'],
    });

    assert.deepEqual(result, []);
  });

  it('flattens commands from multiple matching patterns', () => {
    const result = resolveMatchingPatterns(['package-lock.json', 'yarn.lock'], {
      'package-lock.json': ['npm install', 'npm audit'],
      'yarn.lock': ['yarn install'],
    });

    assert.deepEqual(result, ['npm install', 'npm audit', 'yarn install']);
  });

  it('deduplicates a command shared by several matching patterns', () => {
    const result = resolveMatchingPatterns(['package-lock.json', 'yarn.lock'], {
      'package-lock.json': ['npm install'],
      'yarn.lock': ['npm install'],
    });

    assert.deepEqual(result, ['npm install']);
  });

  it('deduplicates a command repeated within a single pattern', () => {
    const result = resolveMatchingPatterns(['package-lock.json'], {
      'package-lock.json': ['npm install', 'npm install'],
    });

    assert.deepEqual(result, ['npm install']);
  });

  it('supports glob patterns', () => {
    const result = resolveMatchingPatterns(['src/deep/index.js'], {
      'src/**/*.js': ['npm test'],
    });

    assert.deepEqual(result, ['npm test']);
  });
});
