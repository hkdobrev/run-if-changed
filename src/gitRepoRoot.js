import { execaSync } from 'execa';

// Absolute path to the top level of the current git working tree. Git invokes
// hooks from the repository root, but resolving it explicitly keeps file
// grouping correct no matter which directory the binary is called from.
export default () => execaSync`git rev-parse --show-toplevel`.stdout.trim();
