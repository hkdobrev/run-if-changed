const { cosmiconfigSync } = require('cosmiconfig');

module.exports = function configLoad() {
  const configResult = cosmiconfigSync('run-if-changed').search();

  if (!configResult || configResult.isEmpty) {
    process.exit(0);
  }

  const { config } = configResult;

  return config;
};
