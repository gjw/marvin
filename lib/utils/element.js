var util = require('util');

var session = require('../webdriver/driver-session');
var webdriver = require('selenium-webdriver');

module.exports = {

  findElement: function (value, type) {
    return session.getDriver().findElement(this.getLocator(value, type));
  },

  findElements: function (value, type) {
    return session.getDriver().findElements(this.getLocator(value, type));
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

  getLocator: function (value, type) {
    if (!type) {
      return webdriver.By.css(value);
    }
    if(webdriver.By.hasOwnProperty(type)) {
      return webdriver.By[type](value);
    } else {
      throw new Error(util.format("Invalid locator type: '%s' for element: '%s'", type, value));
    }
  }

};
