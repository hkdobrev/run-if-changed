#!/usr/bin/env node

const cliInit = require('./src/cliInit');
const configLoad = require('./src/configLoad');
const runAll = require('./src/runAll');

cliInit();
runAll(configLoad());
