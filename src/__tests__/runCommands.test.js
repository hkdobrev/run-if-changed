import { jest } from '@jest/globals';

const mockRun = jest.fn();
const MockListr = jest.fn();
const mockCommandFn = jest.fn();
const mockExecaCommandSync = jest.fn();

jest.unstable_mockModule('listr2', () => ({
  Listr: MockListr,
}));

jest.unstable_mockModule('execa', () => ({
  execaCommandSync: mockExecaCommandSync,
}));

const { default: runCommands } = await import('../runCommands.js');

describe('runCommands', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRun.mockResolvedValue(undefined);
    MockListr.mockImplementation(() => ({ run: mockRun }));
    mockExecaCommandSync.mockReturnValue(mockCommandFn);
  });

  it('creates a Listr task for each command and runs them', async () => {
    await runCommands(['npm install', 'npm test']);

    const [tasks] = MockListr.mock.calls[0];
    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('npm install');
    expect(tasks[1].title).toBe('npm test');
    expect(mockRun).toHaveBeenCalledTimes(1);
  });

  it('accepts a single string command', async () => {
    await runCommands('npm install');

    const [tasks] = MockListr.mock.calls[0];
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('npm install');
  });

  it('filters out falsy commands', async () => {
    await runCommands(['npm install', '', null, undefined]);

    const [tasks] = MockListr.mock.calls[0];
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('npm install');
  });

  it('runs Listr with concurrent: false and simple renderer', async () => {
    await runCommands(['npm install']);

    const [, options] = MockListr.mock.calls[0];
    expect(options).toMatchObject({ concurrent: false, renderer: 'simple' });
  });

  it('executes the command via execaCommandSync when a task runs', async () => {
    await runCommands(['npm install']);

    const [tasks] = MockListr.mock.calls[0];
    tasks[0].task();

    expect(mockExecaCommandSync).toHaveBeenCalledWith({
      preferLocal: true,
      stdout: 'inherit',
      stderr: 'inherit',
    });
    expect(mockCommandFn).toHaveBeenCalledWith('npm install');
  });
});
