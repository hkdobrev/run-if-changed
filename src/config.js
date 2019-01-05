const cosmiconfig = require('cosmiconfig');

const configResult = cosmiconfig('run-if-changed').searchSync();

if (!configResult || configResult.isEmpty) {
  process.exit(0);
}

const { config } = configResult;

module.exports = config;
