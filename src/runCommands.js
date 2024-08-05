const execa = require('execa');
const findBinary = require('./findBinary');

function runBinary(command) {
  const { binaryPath, args } = command;
  const result = execa(binaryPath, args);
  result.stdout.pipe(process.stdout);
  result.stderr.pipe(process.stderr);
}

function normaliseCommands(commands) {
  return Array.isArray(commands) ? commands : [commands].filter((x) => !!x);
}

module.exports = function runCommands(commands) {
  normaliseCommands(commands).map(findBinary).forEach(runBinary);
};
