var elementUtils = require('../utils/element');

var Component = function (props) {
  return Object.create(this, props);
};

Component.prototype = Object.create({}, {

  element: {
    value: function (selector, type) {
      var rootEl = elementUtils.findElement(this.rootNode);
      var elementLocator = elementUtils.getLocator(selector, type);
      var result = rootEl.findElement(elementLocator);
      result._root = elementUtils.getLocator(this.rootNode);
      result._locator = elementLocator;
      return result;
    }
  },

  elements: {
    value: function (selector, type) {
      return elementUtils.findElement(this.rootNode).findElements(elementUtils.getLocator(selector, type));
    }
  },
  
  goOn: {
    value: function(selector, type) {
      return elementUtils.findElement(this.rootNode).then(function(rootEl) {
        return elementUtils.goOn(selector, type, rootEl);
      });
    }
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
  }

});

exports = module.exports = Component;
