// Test fixture: appends its arguments as a line to `marker.log` in the current
// working directory. e2e tests configure run-if-changed to invoke this script
// and then assert on the contents of marker.log to prove which commands ran.
import { appendFileSync } from 'node:fs';

appendFileSync('marker.log', `${process.argv.slice(2).join(' ')}\n`);
