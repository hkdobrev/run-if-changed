import { execaSync } from 'execa';

export default () => execaSync({ lines: true })`git diff-tree --name-only --no-commit-id -r HEAD@{1} HEAD`
  .stdout
  .filter((file) => !!file);
