var elementUtils = require('../utils/element');

var Component = function (props) {
  return Object.create(this, props);
};

Component.prototype = Object.create({}, {

  element: {
    value: function (selector, type) {
      return elementUtils.findElement(this.rootNode).findElement(elementUtils.getLocator(selector, type));
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
