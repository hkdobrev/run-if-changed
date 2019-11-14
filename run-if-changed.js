#!/usr/bin/env node

const config = require('./src/configLoad')();
const changedFiles = require('./src/gitChangedFilesSinceLastHead')();

if (changedFiles.length === 0) {
  process.exit(0);
}

const resolveMatchingPatterns = require('./src/resolveMatchingPatterns');
const runCommands = require('./src/runCommands');

runCommands(resolveMatchingPatterns(changedFiles, config));
