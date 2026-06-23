import { cosmiconfigSync } from 'cosmiconfig';

// A single explorer, reused (and internally cached) across directories. The
// 'none' search strategy inspects only the directory it is given and never
// walks up, which lets resolveConfigGroups implement its own repo-root-bounded
// walk and decide how directories without a config inherit an ancestor's.
const explorer = cosmiconfigSync('run-if-changed', {
  searchStrategy: 'none',
});

// Load the run-if-changed config defined directly in `dir`, or null if there
// is none (or it is empty).
export default (dir) => {
  const result = explorer.search(dir);

  return result && !result.isEmpty ? result.config : null;
};
