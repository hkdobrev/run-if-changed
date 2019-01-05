const runIfFileChanged = require('./run-if-file-changed');

function runCommandsForFile(file, commands) {
  const commandsList = Array.isArray(commands) ? commands : [commands].filter();

  if (commandsList.length === 0) {
    return;
  }

  runIfFileChanged(file, commandsList);
}

module.exports = function runAll(config) {
  Object.entries(config).forEach(([file, commands]) => runCommandsForFile(file, commands));
};
