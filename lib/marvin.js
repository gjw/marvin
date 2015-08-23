var path = require('path');


var session = require('./webdriver/driver-session');

var Component = require('./page-object/component');
var Page = require('./page-object/page');




var config = require(path.join(process.cwd(), 'config.json'));







exports = module.exports = {
  config: config,
  session: session,
  Page: Page,
  Component: Component
};
