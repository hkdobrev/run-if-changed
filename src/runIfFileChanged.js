const execa = require('execa');
const findBinary = require('./findBinary');

const binary = `${__dirname}/../bin/git-run-if-changed.sh`;

function resolveCommand(command) {
  const { binaryPath, args: binaryArgs } = findBinary(command);

  return [binaryPath].concat(binaryArgs).join(' ');
}

module.exports = function runIfFileChanged(fileToCheck, commandsList) {
  const args = [fileToCheck].concat(commandsList.map(resolveCommand));
  const command = execa(binary, args);
  command.stdout.pipe(process.stdout);
  command.stderr.pipe(process.stderr);
};
