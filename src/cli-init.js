const cli = require('commander');
const pkg = require('../package.json');

module.exports = function cliInit() {
  cli
    .version(pkg.version, '-v, --version')
    .parse(process.argv);
};
