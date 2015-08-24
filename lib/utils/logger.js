
var session = require('../webdriver/driver-session');

var LEVELS = {
  info: 1,
  warning: 2,
  error: 3
};
exports = module.exports = {

  logs: [],
  /**
   * @param {Object} log: the log object; it may contain the following properties
   * @prop type
   * @prop text
   * @prop level
   * @prop status
   * @prop data
   */
  _add: function(log) {
  },

  /** 
   * @name log
   * @param {String} msg: a message that should appear in the report
   * @param {String} level: one of info, warning, error; default is Info.
   * @description Add in the report the msg message
   */
  log: function(msg, level){
    var lv = level && LEVEL[level.toLowerCase()] ? level.toLowerCase() : 'info';
    this._add({ type: 'text', text: msg, level: lv });
  },

  /** 
   * @name assert
   * @param {Primitive} value: the value that we want validate
   * @param {Primitive} expectedValue: the expected value of the param "value" 
   * @param {String} alert: the message displayed in the report in case the assertion fail
   * @description Check value against expectedValue.. it should be used for not blocking assertions. Assert should be used only on primitives.
   */
  assert: function(value, expectedValue, alert) {
    if (typeof value == 'object'){
      return this.log('assert should be used only on primitive values', 'warning');
    }
    var passed = value === expectedValue;
    if (!passed || session.config.verbose){
      this._add({ type: 'assertion', status: passed, text: alert });
    }
  },

  /** 
   * @name dir
   * @param {Object} obj: a generic object
   * @param {String} objName: the name of the object
   * @description Add in the report a x-sized table with obj's own properties
   */
  dir: function(obj, objName){
    if (obj && typeof obj == 'object'){
      obj = obj instanceof Array ? obj : [obj];
      this._add({ type: 'table', text: objName, data: obj });
    }
  },

  /** 
   * @name value
   * @param {String} key: the name of a variable
   * @param {String} value: the value of a variable
   * @description Add in the report a two-columns table with the mapping key/value
   */
  value: function (key, value){
    var obj = {};
    obj[key] = value;
    this._add({ type: 'table', data: obj });
  }

