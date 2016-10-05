var fs = require('fs');
var nconf = require('nconf');

var env = process.env.NODE_ENV;
if (env === undefined) {
  console.log('NODE_ENV not set in environment, defaulting to DEV');
  env = 'dev';
}

var cfgf = env.toLowerCase() + '.config.json';
try {
  fs.statSync(cfgf);
} catch (e) {
  console.log('Could not find config file ' + cfgf + ', aborting.');
  process.exit(1);
}
nconf.argv().env().file(cfgf);

var config = nconf.get();

exports = module.exports = Object.freeze(config);
