var path = require('path');


var session = require('./webdriver/driver-session');

var Component = require('./page-object/component');
var Page = require('./page-object/page');


var log = require('./utils/logger');

var config = require(path.join(process.cwd(), 'config.json'));








exports = module.exports = {
  config: config,
  session: session,
  log: log,
  Page: Page,
  Component: Component
};


