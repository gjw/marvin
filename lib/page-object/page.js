
var session = require('../webdriver/driver-session');

var pageUtils = require('../utils/page');
var elementUtils = require('../utils/element');

var Page = function (props) {
  return Object.create(this, props);
};

Page.prototype = Object.create({}, {

  visit: { value: pageUtils.visit },

  element: {
    value: function (selector, type) {
      return elementUtils.findElement(selector, type);
    }
  },

  elements: { 
    value: function (selector, type) { 
      return elementUtils.findElements(selector, type);
    }
  },

  goOn: function(value, type) {
    return elementUtils.goOn(value, type);
  },

  select: {
    value: function (selector, type) {
      return elementUtils.addSelectOption(this.element(selector, type));
    }
  },

  waitFor: {
    value: function (fn, timeout) {
      return elementUtils.waitFor(fn, timeout);
    }
  },

  component: {
    value: function (component, rootNode) {
      component.rootNode = rootNode;
      return component;
    }
  }

});

exports = module.exports = Page;
