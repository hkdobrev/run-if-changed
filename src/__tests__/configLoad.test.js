import { jest } from '@jest/globals';

const mockSearch = jest.fn();

jest.unstable_mockModule('cosmiconfig', () => ({
  cosmiconfigSync: jest.fn(() => ({ search: mockSearch })),
}));

const { default: configLoad } = await import('../configLoad.js');

describe('configLoad', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the config when found', () => {
    const config = { 'package-lock.json': ['npm install'] };
    mockSearch.mockReturnValue({ config });

    const result = configLoad();

    expect(result).toEqual(config);
  });

  it('calls process.exit(0) when no config is found', () => {
    mockSearch.mockReturnValue(null);
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    expect(() => configLoad()).toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
  });

  it('calls process.exit(0) when config is empty', () => {
    mockSearch.mockReturnValue({ isEmpty: true });
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    expect(() => configLoad()).toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
  });
});
