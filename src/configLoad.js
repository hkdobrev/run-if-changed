const cosmiconfig = require('cosmiconfig');

module.exports = function configLoad() {
  const configResult = cosmiconfig('run-if-changed').searchSync();

  if (!configResult || configResult.isEmpty) {
    process.exit(0);
  }

  const { config } = configResult;

  return config;
};
