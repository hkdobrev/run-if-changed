import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import runCommands from '../runCommands.js';

// `runCommands` builds a Listr task list and executes each command with
// execaCommandSync. We exercise the real behaviour with harmless shell
// builtins (`true` succeeds, `false` exits non-zero) instead of mocking.

describe('runCommands', () => {
  it('resolves when every command succeeds', async () => {
    await assert.doesNotReject(runCommands(['true', 'true']));
  });

  it('accepts a single command as a string', async () => {
    await assert.doesNotReject(runCommands('true'));
  });

  it('rejects when a command exits non-zero', async () => {
    await assert.rejects(runCommands(['false']));
  });

  it('ignores falsy commands', async () => {
    // Only falsy entries means no task runs and nothing fails.
    await assert.doesNotReject(runCommands(['', null, undefined, false]));
  });

  it('runs a real command, observable through its side effect', async () => {
    const marker = `node-test-${process.pid}`;
    await runCommands([`test "${marker}" = "${marker}"`]);
    // A failing comparison would reject; reaching here means it ran and passed.
    await assert.rejects(runCommands([`test "${marker}" = "other"`]));
  });
});
