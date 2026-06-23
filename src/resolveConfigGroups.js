import { dirname, join, relative } from 'node:path';

// Group changed files by the config that governs them, so each group can run
// its commands in the right directory. This is what makes monorepos work: a
// single git repo can hold many `run-if-changed` configs (one per package).
//
// For every changed file we walk up from its directory to the repository root
// and stop at the first directory that defines a config — the "nearest config
// wins". A directory without its own config (e.g. a package.json that has no
// `run-if-changed` key) inherits the next config found further up, all the way
// to a config at the repo root. Files with no config anywhere are ignored.
//
// `loadConfig(dir)` returns the config defined directly in `dir`, or null. It
// is injected so this stays pure and easy to test.
export default (changedFiles, repoRoot, loadConfig) => {
  const cache = new Map();

  const ownerOf = (startDir) => {
    let dir = startDir;

    while (true) {
      if (!cache.has(dir)) {
        cache.set(dir, loadConfig(dir));
      }

      const config = cache.get(dir);
      if (config) {
        return { dir, config };
      }

      if (dir === repoRoot) {
        return null;
      }

      const parent = dirname(dir);
      if (parent === dir) {
        return null;
      }

      dir = parent;
    }
  };

  const groups = new Map();

  for (const file of changedFiles) {
    const fileAbsolute = join(repoRoot, file);
    const owner = ownerOf(dirname(fileAbsolute));

    if (!owner) {
      continue;
    }

    if (!groups.has(owner.dir)) {
      groups.set(owner.dir, { cwd: owner.dir, config: owner.config, files: [] });
    }

    groups.get(owner.dir).files.push(relative(owner.dir, fileAbsolute));
  }

  return [...groups.values()];
};
