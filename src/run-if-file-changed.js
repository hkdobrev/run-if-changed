const execa = require('execa');
const findBinary = require('./find-binary');

const binary = `${__dirname}/../bin/git-run-if-changed.sh`;

function resolveCommand(command) {
  const { binaryPath, args: binaryArgs } = findBinary(command);

  return [binaryPath].concat(binaryArgs).join(' ');
}

module.exports = function runIfFileChanged(fileToCheck, commandsList) {
  const args = [fileToCheck].concat(commandsList.map(resolveCommand));
  execa(binary, args).stdout.pipe(process.stdout);
};
