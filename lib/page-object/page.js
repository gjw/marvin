var session      = require('../env/session'),
    pageUtils    = require('../utils/page-utils'),
    elementUtils = require('../utils/element-utils');

var Page = function (props) {
  return Object.create(this, props);
};

Page.prototype = Object.create({}, {
  visit:      { value: pageUtils.visit },
  title:      { value: pageUtils.title },
  element:    { value: function (selector, type) { return elementUtils.findElement(selector, type); } },
  elements:   { value: function (selector, type) { return elementUtils.findElements(selector, type); } },
  select:     { value: function (selector, type) { return elementUtils.addSelectOption(this.element(selector, type)); } },
  waitFor:    { value: function (fn, timeout) { return elementUtils.waitFor(fn, timeout); } },
  component:  { value: function (component, rootNode) {
    component.rootNode = rootNode;
    return component;
  } },
  alert: { get: function () { return elementUtils.alert(); } }
});

exports = module.exports = Page;
