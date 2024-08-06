#!/usr/bin/env node

import resolveMatchingPatterns from './src/resolveMatchingPatterns';
import runCommands from './src/runCommands';
import configLoad from './src/configLoad';
import gitChangedFilesSinceLastHead from './src/gitChangedFilesSinceLastHead';

const changedFiles = gitChangedFilesSinceLastHead();

if (changedFiles.length === 0) {
  process.exit(0);
}

runCommands(resolveMatchingPatterns(changedFiles, configLoad()));
