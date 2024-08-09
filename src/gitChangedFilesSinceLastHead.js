import { execaSync } from 'execa';

// Get the list of changed files since the previous HEAD from a git hook
export default () => execaSync({ lines: true })`git diff-tree --name-only --no-commit-id --diff-filter=d --ignore-submodules -r HEAD@{1} HEAD`
  .stdout
  .filter((file) => !!file);
