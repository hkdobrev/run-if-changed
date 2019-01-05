#!/usr/bin/env node

const cli = require('commander');
const execa = require('execa');
const config = require('./src/config');
const findBinary = require('./src/find-binary');
const pkg = require('./package.json');

cli
  .version(pkg.version, '-v, --version')
  .parse(process.argv);

const binary = `${__dirname}/bin/git-run-if-changed.sh`;

function runCommandsIfFileChanged(fileToCheck, commands) {
  const commandsList = Array.isArray(commands) ? commands : [commands];
  const commandsListResolved = commandsList.map((cmd) => {
    const { binaryPath, args: binaryArgs } = findBinary(cmd);

    return [binaryPath].concat(binaryArgs).join(' ');
  });
  const args = [fileToCheck].concat(commandsListResolved);
  execa(binary, args).stdout.pipe(process.stdout);
}

Object.entries(config).forEach(([file, commands]) => {
  if (commands.length === 0) {
    return;
  }

  runCommandsIfFileChanged(file, commands);
});
