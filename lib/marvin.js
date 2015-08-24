var path = require('path');

/**
 * marvin-js configuration file;
 * it should be provided by the environment that define the test suite
 */
var config = require(path.join(process.cwd(), 'config.json'));

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
