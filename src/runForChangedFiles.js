const matcher = require('./matcher');
const runCommands = require('./runCommands');

module.exports = function runForChangedFiles(changedFiles, config) {
  Object.entries(config)
    .filter(([pattern]) => matcher(changedFiles, [pattern]))
    .forEach(([, commands]) => runCommands(commands));
};
