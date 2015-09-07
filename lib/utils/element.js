var util = require('util');

var config = require('./config.js');
var session = require('../webdriver/driver-session');

module.exports = {

  findElement: function (selector, type) {
    return session.getDriver().findElement(this.getLocator(selector, type));
  },

  findElements: function (selector, type) {
    return session.getDriver().findElements(this.getLocator(selector, type));
  },

  goOn: function(selector, type, rootEl) {
    var elem;
    if (typeof selector == 'string'){
      elem = rootEl ? rootEl.findElement(this.getLocator(selector, type)) : this.findElement(selector, type);
    }
    else {
      elem = selector;
    }
    return elem.then(function(el) {
      return session.getDriver().actions().mouseMove(el).perform();
    });
  },

  addSelectOption: function (elem) {
    var webdriver = session.getWebdriver();
    elem.selectOption = function (option) {
      elem.click();
      return elem.findElement(webdriver.By.css(util.format("option[value='%s']",
        option.toString() ))).click();
    };
    return elem;
  },

  waitFor: function (fn, timeout) {
    var t = timeout || config.elementTimeout || 3000;
    return session.getDriver().wait(fn, t);
  },

  getLocator: function (selector, type) {
    var webdriver = session.getWebdriver();
    if (!type) {
      return webdriver.By.css(selector);
    }
    if(webdriver.By.hasOwnProperty(type)) {
      return webdriver.By[type](selector);
    } else {
      throw new Error(util.format("Invalid locator type: '%s' for element: '%s'", type, selector));
    }
  }

};
