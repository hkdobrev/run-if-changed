import resolveMatchingPatterns from '../resolveMatchingPatterns.js';

describe('resolveMatchingPatterns', () => {
  it('returns commands for a matching pattern', () => {
    const result = resolveMatchingPatterns(['package-lock.json'], {
      'package-lock.json': ['npm install'],
    });
    expect(result).toEqual(['npm install']);
  });

  it('returns an empty array when no patterns match', () => {
    const result = resolveMatchingPatterns(['README.md'], {
      'package-lock.json': ['npm install'],
    });
    expect(result).toEqual([]);
  });

  it('deduplicates commands that appear in multiple matching patterns', () => {
    const result = resolveMatchingPatterns(['package-lock.json', 'yarn.lock'], {
      'package-lock.json': ['npm install'],
      'yarn.lock': ['npm install'],
    });
    expect(result).toEqual(['npm install']);
  });

  it('flattens commands from multiple matching patterns', () => {
    const result = resolveMatchingPatterns(['package-lock.json', 'yarn.lock'], {
      'package-lock.json': ['npm install', 'npm audit'],
      'yarn.lock': ['yarn install'],
    });
    expect(result).toEqual(['npm install', 'npm audit', 'yarn install']);
  });

  it('supports glob patterns', () => {
    const result = resolveMatchingPatterns(['src/index.js'], {
      'src/**/*.js': ['npm test'],
    });
    expect(result).toEqual(['npm test']);
  });

  it('returns an empty array when changedFiles is empty', () => {
    const result = resolveMatchingPatterns([], {
      'package-lock.json': ['npm install'],
    });
    expect(result).toEqual([]);
  });
});
