#!/usr/bin/env node

require('./src/cliInit')();

const changedFiles = require('./src/gitChangedFilesSinceLastHead')();

if (changedFiles.length === 0) {
  process.exit(0);
}

const config = require('./src/configLoad')();

require('./src/runForChangedFiles')(changedFiles, config);
