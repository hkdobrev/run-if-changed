#!/usr/bin/env node

import resolveMatchingPatterns from './src/resolveMatchingPatterns.js';
import resolveConfigGroups from './src/resolveConfigGroups.js';
import runCommands from './src/runCommands.js';
import configLoad from './src/configLoad.js';
import gitChangedFilesSinceLastHead from './src/gitChangedFilesSinceLastHead.js';
import gitRepoRoot from './src/gitRepoRoot.js';

const changedFiles = gitChangedFilesSinceLastHead();

if (changedFiles.length === 0) {
  process.exit(0);
}

// In a monorepo a single repo may hold several configs; group the changed
// files by the config that owns them so each group's commands run in their
// own directory.
const groups = resolveConfigGroups(changedFiles, gitRepoRoot(), configLoad);

if (groups.length === 0) {
  process.exit(0);
}

try {
  for (const { cwd, config, files } of groups) {
    await runCommands(resolveMatchingPatterns(files, config), { cwd });
  }
} catch {
  // Listr/execa have already printed the failing command and its output, so
  // just surface a non-zero exit code without dumping an unhandled-rejection
  // stack trace at the user.
  process.exitCode = 1;
}
