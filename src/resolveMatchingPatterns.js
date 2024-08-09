import micromatch from 'micromatch';

export default (changedFiles, config) => {
  const commandsToRun = Object.entries(config)
    .filter(([pattern]) => micromatch.some(changedFiles, [pattern]))
    .flatMap(([, commands]) => commands);

  // unique commands, do not run them multiple times if they are the same
  // for multiple patterns or they are repeated in a list for a single pattern
  return [...new Set(commandsToRun)];
};
