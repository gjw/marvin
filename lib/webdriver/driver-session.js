var fs = require('fs');
var path = require('path');

var webdriver = require('selenium-webdriver');


var url = require('url');
var wrench = require('wrench');


var _config = null;

module.exports = {

  get config() { 
    if (_config != null) {
      return _config
    }
    _config = require('marvin-js').config;
    return Object.freeze(_config); 
  },

  create: function () {
    return this.execute(function(){
      driver = new webdriver.Builder()
        .usingServer(this.config.seleniumServer)
        .withCapabilities(this.config.browser)
        .build();
      driver.manage().timeouts().implicitlyWait(this.config.elementTimeout || 3000);
      driver.manage().window().maximize();
    }.bind(this));
  },

  getDriver: function() {
    return driver;
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
    var filePath = path.join(this.config.resultsDir, 'screenshots', filename);
    driver.takeScreenshot().then(function (data) {
      fs.writeFileSync(filePath, data, 'base64');
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

  reset: function () {
    this.execute(function () {
      driver.manage().deleteAllCookies();
      driver.get("about:blank");
    });
  },

  refresh: function () {
    driver.navigate().refresh();
  },

  currentUrl: function (parsedUrlHandler) {
    // @todo make currentUrl return a promise
    driver.getCurrentUrl().then(function (currentUrl) {
      parsedUrlHandler(url.parse(currentUrl));
    });
  }

  // @todo
  /*savePerfLog: function (name) {
    var dir = path.join(session.resultsDir, 'perf_logs');
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
