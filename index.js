#!/usr/bin/env node

const cliInit = require('./src/cli-init');
const configLoad = require('./src/config-load');
const runAll = require('./src/run-all');

cliInit();
runAll(configLoad());
