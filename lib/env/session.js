var webdriver = require('selenium-webdriver');
var fs        = require('fs');
var path      = require('path');
var url       = require('url');
var wrench    = require('wrench');
var config;
var driver;

module.exports = {

  create: function () {
    config = require('marvin').config;
    driver = new webdriver.Builder()
      .usingServer(config.seleniumServer)
      .withCapabilities(config.browser)
      .build();

    return this.execute(function(){
      driver.manage().timeouts().implicitlyWait(config.elementTimeout || 3000);
      driver.manage().window().maximize();
    });
  },

  execute: function (fn) {
    return webdriver.promise.controlFlow().execute(fn);
  },

  defer: function () {
    return webdriver.promise.defer();
  },

  resizeWindow: function (x, y) {
    driver.manage().window().setSize(x, y);
  },

  saveScreenshot: function (name) {
    var filename = name.replace(/\W+/g, '-').toLowerCase() + '.png';
    driver.takeScreenshot().then(function (data) {
      fs.writeFileSync(path.join(config.resultsDir || 'results', 'screenshots', filename), data, 'base64');
    });
  },

  deleteAllCookies: function () {
    driver.manage().deleteAllCookies();
  },

  addCookie: function (name, value, optDomain, optPath, optIsSecure, optExpiry){
    driver.manage().addCookie(name, value, optPath, optDomain, optIsSecure, optExpiry);
  },

  getCookie: function (cookieName) {
    return driver.manage().getCookie(cookieName);
  },

  getDriver: function() {
    return driver;
  },

  reset: function () {
    webdriver.promise.controlFlow().execute(function () {
      driver.manage().deleteAllCookies();
      driver.get("about:blank");
    });
  },

  refresh: function () {
    driver.navigate().refresh();
  },

  currentUrl: function (parsedUrlHandler) {
    driver.getCurrentUrl().then(function (currentUrl) {
      parsedUrlHandler(url.parse(currentUrl));
    });
  },

  savePerfLog: function (name) {
    var dir = path.join(config.resultsDir, 'perf_logs');
    wrench.mkdirSyncRecursive(dir);
    var perfLog = [];
    driver.manage().logs().get('performance').then(function (logs) {
      logs.forEach(function (log) {
        var level = JSON.parse(log.message);
        perfLog.push(level.message);
      });
      fs.writeFileSync(path.join(dir, name + '.json'), JSON.stringify(perfLog));
    });
  }

};
