#!/usr/bin/env node


const cli = require('commander');
const util = require('util');
const process = require('process');
const cosmiconfig = require('cosmiconfig');
const exec = util.promisify(require('child_process').exec);
const pkg = require('./package.json');

cli
  .version(pkg.version, '-v, --version')
  .parse(process.argv);

async function runCommandsIfFileChanged(fileToCheck, commandsList) {
  const commandsString = commandsList.map(x => `"${x}"`).join(' ');
  const command = `./bin/git-run-if-changed.sh "${fileToCheck}" ${commandsString}`;
  const response = await exec(command);
  const { stdout, stderr } = response;
  if (stdout) {
    console.log(stdout);
  }
  if (response instanceof Error) {
    console.error('There was an error executing script:');
  }
  if (stderr) {
    console.error(stderr);
  }
}

const configResult = cosmiconfig(pkg.name).searchSync();

if (!configResult || configResult.isEmpty) {
  process.exit(0);
}

const { config } = configResult;

Object.entries(config).forEach(([file, commands]) => {
  if (commands.length === 0) {
    return;
  }

  runCommandsIfFileChanged(file, commands);
});
