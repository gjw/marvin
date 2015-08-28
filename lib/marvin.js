var path = require('path');
var nconf = require('nconf');

nconf.argv().env().file('config.json');

/**
 * marvin-js configuration file;
 * it should be provided by the environment that define the test suite
 */
var config = nconf.get();

/**
 * marvin-js webdriver session;
 * ... 
 */
var session = require('./webdriver/driver-session');

/**
 * marvin-js logs;
 * ... 
 */
var log = require('./utils/logger');

/**
 * marvin-js Component
 * ... 
 */
var Component = require('./page-object/component');

/**
 * marvin-js Page
 * ... 
 */
var Page = require('./page-object/page');


exports = module.exports = {
  config: config,
  session: session,
  log: log,
  Page: Page,
  Component: Component
};
