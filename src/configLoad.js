import { cosmiconfigSync } from 'cosmiconfig';

export default () => {
  const configResult = cosmiconfigSync('run-if-changed', {
    searchStrategy: 'project',
  }).search();

  if (!configResult || configResult.isEmpty) {
    process.exit(0);
  }

  const { config } = configResult;

  return config;
};
