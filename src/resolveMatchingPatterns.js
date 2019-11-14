const matcher = require('./matcher');

module.exports = function resolveMatchingPatterns(list, config) {
  const commandsToRun = Object.entries(config)
    .filter(([pattern]) => matcher(list, [pattern]))
    .map(([, commands]) => commands)
    // Flatten array
    .reduce((acc, val) => acc.concat(val), []);

  // unique commands, do not run them multiple times if they are the same
  // for multiple patterns or they are repeated in a list for a single pattern
  return [...new Set(commandsToRun)];
};
