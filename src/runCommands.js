import { execaSync, parseCommandString } from 'execa';
import { Listr } from 'listr2';

const runCommand = (command, cwd) => {
  const [file, ...args] = parseCommandString(command);

  execaSync(file, args, {
    cwd,
    preferLocal: true,
    stdout: 'inherit',
    stderr: 'inherit',
  });
};

export default (commands, { cwd } = {}) => {
  const tasks = new Listr(
    (Array.isArray(commands) ? commands : [commands])
      .filter((x) => !!x)
      .map((command) => ({
        title: command,
        task: () => runCommand(command, cwd),
      })),
    {
      concurrent: false,
      renderer: 'simple',
    },
  );

  return tasks.run();
};
