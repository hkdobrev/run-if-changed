import { jest } from '@jest/globals';

const mockTaggedFn = jest.fn();
const mockExecaSync = jest.fn(() => mockTaggedFn);

jest.unstable_mockModule('execa', () => ({
  execaSync: mockExecaSync,
}));

const { default: gitChangedFilesSinceLastHead } =
  await import('../gitChangedFilesSinceLastHead.js');

describe('gitChangedFilesSinceLastHead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecaSync.mockReturnValue(mockTaggedFn);
  });

  it('returns the list of changed files', () => {
    mockTaggedFn.mockReturnValue({ stdout: ['src/index.js', 'README.md'] });

    const result = gitChangedFilesSinceLastHead();

    expect(result).toEqual(['src/index.js', 'README.md']);
  });

  it('filters out empty strings from the output', () => {
    mockTaggedFn.mockReturnValue({ stdout: ['src/index.js', '', 'README.md'] });

    const result = gitChangedFilesSinceLastHead();

    expect(result).toEqual(['src/index.js', 'README.md']);
  });

  it('returns an empty array when no files changed', () => {
    mockTaggedFn.mockReturnValue({ stdout: [] });

    const result = gitChangedFilesSinceLastHead();

    expect(result).toEqual([]);
  });

  it('calls execaSync with lines option', () => {
    mockTaggedFn.mockReturnValue({ stdout: [] });

    gitChangedFilesSinceLastHead();

    expect(mockExecaSync).toHaveBeenCalledWith({ lines: true });
  });
});
