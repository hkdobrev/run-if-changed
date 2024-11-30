import { execaCommandSync } from 'execa';
import { Listr } from 'listr2';

const runCommand = (command) => {
  execaCommandSync({
    preferLocal: true,
    stdout: 'inherit',
    stderr: 'inherit',
  })(command);
};

export default (commands) => {
  const tasks = new Listr(
    (Array.isArray(commands) ? commands : [commands])
      .filter((x) => !!x)
      .map((command) => ({
        title: command,
        task: () => runCommand(command),
      })),
    {
      concurrent: false,
      renderer: 'simple',
    }
  );

  return tasks.run();
};
