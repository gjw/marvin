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
    })
  },

  saveScreenshot: function (name) {
    var filename = name.replace(/\W+/g, '-').toLowerCase() + '.png';
    var filePath = path.join(this.config.resultsDir, 'screenshots', filename);
    driver.takeScreenshot().then(function (data) {
      fs.writeFileSync(filePath, data, 'base64');
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
