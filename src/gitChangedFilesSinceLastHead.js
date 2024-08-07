import execa from 'execa';

function getFilesFromGit() {
  const { stdout } = execa.sync('git', [
    'diff-tree',
    '--name-only',
    '--no-commit-id',
    '-r',
    'HEAD@{1}',
    'HEAD',
  ]);

  return stdout;
}

export default () => {
  const changedFiles = getFilesFromGit();

  return changedFiles.split('\n').filter((file) => !!file);
};
