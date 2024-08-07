#!/usr/bin/env node

import resolveMatchingPatterns from './src/resolveMatchingPatterns.js';
import runCommands from './src/runCommands.js';
import configLoad from './src/configLoad.js';
import gitChangedFilesSinceLastHead from './src/gitChangedFilesSinceLastHead.js';

const changedFiles = gitChangedFilesSinceLastHead();

if (changedFiles.length === 0) {
  process.exit(0);
}

runCommands(resolveMatchingPatterns(changedFiles, configLoad()));
