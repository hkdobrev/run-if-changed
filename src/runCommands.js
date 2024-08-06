import execa from 'execa';
import findBinary from './findBinary';

function runBinary(command) {
  const { binaryPath, args } = command;
  const result = execa(binaryPath, args);
  result.stdout.pipe(process.stdout);
  result.stderr.pipe(process.stderr);
}

function normaliseCommands(commands) {
  return Array.isArray(commands) ? commands : [commands].filter((x) => !!x);
}

export default (commands) => {
  normaliseCommands(commands).map(findBinary).forEach(runBinary);
};
