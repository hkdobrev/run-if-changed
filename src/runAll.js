const runIfFileChanged = require('./runIfFileChanged');

function runCommandsForFile(file, commands) {
  const commandsList = Array.isArray(commands) ? commands : [commands].filter(x => !!x);

  if (commandsList.length === 0) {
    return;
  }

  runIfFileChanged(file, commandsList);
}

module.exports = function runAll(config) {
  Object.entries(config).forEach(([file, commands]) => runCommandsForFile(file, commands));
};
