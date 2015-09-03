var fs = require('fs');
var url = require('url');
var path = require('path');
var util = require('util');


var wrench = require('wrench');
var webdriver = require('selenium-webdriver');

var logger = require('../utils/logger.js');
var config = require('../utils/config.js');


var driver;

module.exports = {

  create: function (browser) {
    return this.execute(function(){
      driver = new webdriver.Builder()
        .usingServer(browser.seleniumServer)
        .withCapabilities(browser)
        .build();
      driver.manage().timeouts().implicitlyWait(config.elementTimeout || 3000);
      driver.manage().window().maximize();
    }.bind(this));
  },

  getDriver: function() {
    return driver;
  },

  execute: function (fn) {
    return webdriver.promise.controlFlow().execute(fn);
  },

  reset: function () {
    this.execute(function () {
      driver.manage().deleteAllCookies();
      driver.get("about:blank");
    });
  },

  refresh: function () {
    return this.execute(function() { return driver.navigate().refresh(); });
  },

  getCurrentUrl: function () {
    return driver.getCurrentUrl().then(function (currentUrl) {
      return new webdriver.promise.Promise(function(resolve) {
        resolve(url.parse(currentUrl));
      });
    });
  },

  getCookie: function (name) {
    return this.execute(function() {
      return driver.manage().getCookie(name);
    });
  },

  addCookie: function (name, value, optDomain, optPath, optIsSecure, optExpiry){
    return this.execute(function() {
      return driver.manage().addCookie(name, value, optPath, optDomain, optIsSecure, optExpiry);
    });
  },

  deleteAllCookies: function () {
    return this.execute(function() {
      return driver.manage().deleteAllCookies();
    });
  },

  resizeWindow: function (x, y) {
    return this.execute(function() {
      return driver.manage().window().setSize(x, y);
    });
  },

  saveScreenshot: (function() {
    var _screenshotId = 0;
    return function (name) {
      var filename = util.format('%d-%d-%s.png', process.pid, _screenshotId++, name.replace(/\W+/g, '-').toLowerCase());
      var filePath = path.join(config.resultsDir, this.launchDate, 'screenshots', filename);
      logger.capture(filename);
      driver.takeScreenshot().then(function (data) {
        fs.writeFileSync(filePath, data, 'base64');
      });
      return filename;
    };
  }())

  // @todo
  /*savePerfLog: function (name) {
    var dir = path.join(config.resultsDir, session.launchDate, 'perf_logs');
    wrench.mkdirSyncRecursive(dir);
    var perfLog = [];
    driver.manage().logs().get('performance').then(function (logs) {
      logs.forEach(function (log) {
        var level = JSON.parse(log.message);
        perfLog.push(level.message);
      });
      fs.writeFileSync(path.join(dir, name + '.json'), JSON.stringify(perfLog));
    });
  }*/

};
