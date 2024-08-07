import micromatch from 'micromatch';

export default (changedFiles, patterns) => micromatch.some(changedFiles, patterns);
