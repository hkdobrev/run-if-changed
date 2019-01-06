const micromatch = require('micromatch');

module.exports = function matcher(changedFiles, patterns) {
  return micromatch.some(changedFiles, patterns);
};
