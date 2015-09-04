var util = require('util');

var session = require('../webdriver/driver-session');
var webdriver = require('selenium-webdriver');

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
    elem.selectOption = function (option) {
      elem.click();
      return elem.findElement(webdriver.By.css(util.format("option[value='%s']",
        option.toString() ))).click();
    };
    return elem;
  },

  waitFor: function (fn, timeout) {
    return session.getDriver().wait(fn, timeout);
  },

  getLocator: function (selector, type) {
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
