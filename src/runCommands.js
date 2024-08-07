import { execaCommandSync } from 'execa';

const runCommand = (command) => {
  process.stdout.write(`${command}: \n`);
  execaCommandSync({
    preferLocal: true,
    stdout: 'inherit',
    stderr: 'inherit',
  })(command);
};

export default (commands) => {
  (Array.isArray(commands) ? commands : [commands])
    .filter((x) => !!x)
    .forEach(runCommand);
};
