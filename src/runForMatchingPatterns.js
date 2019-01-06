const matcher = require('./matcher');
const runCommands = require('./runCommands');

module.exports = function runForMatchingPatterns(files, config) {
  Object.entries(config)
    .filter(([pattern]) => matcher(files, [pattern]))
    .forEach(([, commands]) => runCommands(commands));
};
