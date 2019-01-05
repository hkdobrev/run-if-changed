const parseStringArgv = require('string-argv');
const which = require('npm-which')(process.cwd());

/*
 *  Try to locate the binary in node_modules/.bin and if this fails, in $PATH.
 *
 *  This allows to use commands installed for the project:
 *
 *      "run-if-checked": {
 *        "src": "webpack"
 *      }
 */
module.exports = function findBinary(commandString) {
  const [binaryName, ...args] = parseStringArgv(commandString);

  /* npm-which tries to resolve the bin in local node_modules/.bin */
  /* and if this fails it look in $PATH */
  try {
    const binaryPath = which.sync(binaryName);

    return { binaryPath, args };
  } catch (err) {
    throw new Error(`${binaryName} binary not found! Probably try \`yarn install ${binaryName}\`.`);
  }
};
