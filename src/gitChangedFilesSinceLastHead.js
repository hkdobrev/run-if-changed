const execa = require('execa');

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

module.exports = function gitChangedFilesSinceLastHead() {
  const changedFiles = getFilesFromGit();

  return changedFiles.split('\n').filter(file => !!file);
};
