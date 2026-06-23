import { execaSync } from 'execa';

// Get the list of changed files since the previous HEAD from a git hook.
//
// `HEAD@{1}` reads the previous position of HEAD from the reflog. On a brand
// new repository (first commit), a freshly cloned/shallow checkout, or any
// time the reflog has fewer than two entries, there is no previous HEAD and
// git fails. In that case there is nothing meaningful to diff against, so we
// treat it as "no files changed" instead of crashing the git hook.
export default () => {
  const previousHead = execaSync({
    reject: false,
  })`git rev-parse --verify --quiet HEAD@{1}`;

  if (previousHead.exitCode !== 0) {
    return [];
  }

  return execaSync({
    lines: true,
  })`git diff-tree --name-only --no-commit-id --diff-filter=d --ignore-submodules -r HEAD@{1} HEAD`.stdout.filter(
    (file) => !!file,
  );
};
