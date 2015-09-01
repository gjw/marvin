
var nconf = require('nconf');
nconf.argv().env().file('config.json');

var config = nconf.get(); 

exports = module.exports = Object.freeze(config);
