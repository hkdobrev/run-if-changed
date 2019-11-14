#!/usr/bin/env node

const config = require('./src/configLoad')();
const changedFiles = require('./src/gitChangedFilesSinceLastHead')();

if (changedFiles.length === 0) {
  process.exit(0);
}

require('./src/runForMatchingPatterns')(changedFiles, config);